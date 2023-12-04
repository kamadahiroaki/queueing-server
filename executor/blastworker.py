import requests
from requests.auth import HTTPBasicAuth
# from requests_toolbelt.multipart.encoder import MultipartEncoder
import time
import json
import subprocess
# import zipfile
# import io
import os
# from dotenv import load_dotenv
# from Bio.Blast import NCBIXML

# load_dotenv()
master = json.load(open("master.json", "r"))
server = json.load(open("server.json", "r"))
url = server["queueingServerUrl"]
auth = HTTPBasicAuth(master["username"], master["password"])

while True:
    headers = {"Content-Type": "application/json"}
    print("url:", url)
    payload = {"executor": "1"}
    try:
        r = requests.post(url + "/jobPull", headers=headers,
                          auth=auth, json=payload)
        r.raise_for_status()
        result = json.loads(r.text)
        job = result["job"]
    except requests.exceptions.HTTPError as err:
        job = None
        print(err)
    except requests.exceptions.ConnectionError as err:
        job = None
        print(err)
    except requests.exceptions.Timeout as err:
        job = None
        print(err)
    except requests.exceptions.RequestException as err:
        job = None
        print(err)

    if job == None:
        print(result["message"])
    else:
        print("job:", job)
        params = json.loads(job["injson"])
        print(params)
        if not os.path.exists("jobFiles"):
            os.makedirs("jobFiles")
        if not os.path.exists("result"):
            os.makedirs("result")
        fileName = job["jobid"]+"_0"
        r = requests.get(url + "/jobFile?fileName=" +
                         fileName, headers=headers, auth=auth)
        with open("jobFiles/" + fileName, "wb") as f:
            f.write(r.content)
        if params["alignTwoOrMoreSequences"] == True:
            fileName = job["jobid"]+"_1"
            r = requests.get(url + "/jobFile?fileName=" +
                             fileName, headers=headers, auth=auth)
            with open("jobFiles/" + fileName, "wb") as f:
                f.write(r.content)

        program_path = ""
#        dbpath = "~/genomeportal/blastdb/"
        dbpath = "blastdb/"
        outFilePath = "result/" + job["jobid"] + ".xml"
        errFilePath = "result/" + job["jobid"] + ".err"
        txtFilePath = "result/" + job["jobid"] + ".txt"
        args = [program_path+params["alignmentTool"], "-out", outFilePath,
                "-outfmt", "5", "-query", "jobFiles/"+job["jobid"]+"_0"]
        cmd = program_path+params["alignmentTool"]+" "
        cmd += "-out "+outFilePath+" "
        cmd += "-outfmt 5 "
        cmd += "-query "+"jobFiles/"+job["jobid"]+"_0"+" "
        if params["alignTwoOrMoreSequences"] == True:
            cmd += "-subject "+"jobFiles/"+job["jobid"]+"_1"+" "
            args.append("-subject")
            args.append("jobFiles/"+job["jobid"]+"_1")
        for key, value in params.items():
            if key == "alignmentTool":
                continue
            if key == "jobTitle":
                continue
            if key == "alignTwoOrMoreSequences":
                continue
            if key == "db" and (params["alignmentTool"] == "blastn" or params["alignmentTool"] == "tblastn" or params["alignmentTool"] == "tblastx"):
                cmd += " -db "+dbpath+value+" "
                args.append("-db")
                args.append(dbpath+value)
                continue
            if key == "db" and (params["alignmentTool"] == "blastp" or params["alignmentTool"] == "blastx"):
                cmd += " -db "+dbpath+value+" "
                args.append("-db")
                args.append(dbpath+value)
                continue
            cmd += "-"+key+" "+str(value)+" "
            args.append("-"+key)
            args.append(str(value))

        print("cmd:", cmd)
#        blastResult = subprocess.run(cmd, capture_output=True, text=True)
        blastResult = subprocess.run(args, capture_output=True, text=True)
        returncode = blastResult.returncode
        print("returncode:", returncode)

        if returncode != 0:
            print("error:", blastResult.stderr)
            with open(errFilePath, "w") as f:
                f.write(blastResult.stderr)
            job["outjson"] = json.dumps(
                job["jobid"] + " failed\n" + blastResult.stderr)
            print(job["outjson"])
            endPayload = {"executor": "1", "job": json.dumps(job)}
            r = requests.post(url + "/jobFinished", auth=auth,
                              data=endPayload, files={"files": open(errFilePath, "r")})
        else:
            job["outjson"] = json.dumps(job["jobid"] + " finished")
            resultFile = open(outFilePath, "r")
            print(job["outjson"])
            endPayload = {"executor": "1", "job": json.dumps(job)}
            # with open(outFilePath) as xmlFile, open(txtFilePath, "w") as txtFile:
            #     blast_records = NCBIXML.parse(xmlFile)
            #     for blast_record in blast_records:
            #         txtFile.write(
            #             f"> {blast_record.query} (length={blast_record.query_length})\n")
            #         for alignment in blast_record.alignments:
            #             for hsp in alignment.hsps:
            #                 txtFile.write(f"  Hit: {alignment.title}\n")
            #                 txtFile.write(f"    Length: {alignment.length}\n")
            #                 txtFile.write(f"    Score: {hsp.score}\n")
            #                 txtFile.write(f"    E-value: {hsp.expect}\n")
            #                 txtFile.write(
            #                     f"    Identity: {hsp.identities}/{hsp.align_length} ({hsp.positives} positives)\n")
            #                 txtFile.write(f"    Query: {hsp.query}\n")
            #                 txtFile.write(f"    Match: {hsp.match}\n")
            #                 txtFile.write(f"    Sbjct: {hsp.sbjct}\n\n")
            files = [("files", open(outFilePath, "r")),
                     ("files", open(txtFilePath, "r"))]
            r = requests.post(url + "/jobFinished", auth=auth,
                              data=endPayload, files=files)
        print("job:", json.dumps(job))
    time.sleep(6)
