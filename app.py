from flask import Flask, render_template, request, jsonify, Response
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import numpy as np
from statistic import Statistic
import io
from io import BytesIO
import csv

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def index():
    return render_template("index.html")

@app.route("/calculate", methods = ["POST"])
def calculate():
    
    data = request.get_json()
    
    values = data["values"]
    rounding = int(data["rounding"])

    objStat = Statistic(np.array(values))
    iqr = objStat.iqr()
    varianceSample = objStat.variance('s')
    standardSample = objStat.standard('s')

    if type(iqr) != str:
        iqr = float(round(iqr, rounding))

    if type(varianceSample) != str:
        varianceSample = float(round(varianceSample, rounding))
        standardSample = float(round(standardSample, rounding))

    response = {
        "success": True,
        "average": float(round(objStat.average(), rounding)),
        "median": float(round(objStat.median(), rounding)),
        "moda": objStat.moda(rounding),
        "variancePopulation": float(round(objStat.variance('p'), rounding)),
        "varianceSample": varianceSample,
        "standardPopulation": float(round(objStat.standard('p'), rounding)),
        "standardSample": standardSample,
        "range": float(round(objStat.range(), rounding)),
        "iqr": iqr
    }

    return jsonify(response)


@app.route("/exportcsv", methods = ["POST"])
def exportcsv():
    data = request.get_json()

    values = data["values"]
    rounding = int(data["rounding"])

    objStat = Statistic(np.array(values))
    iqr = objStat.iqr()
    varianceSample = objStat.variance('s')
    standardSample = objStat.standard('s')

    if type(iqr) != str:
        iqr = float(round(iqr, rounding))

    if type(varianceSample) != str:
        varianceSample = float(round(varianceSample, rounding))
        standardSample = float(round(standardSample, rounding))

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["VALORI"])
    for value in values:
        writer.writerow([value])

    writer.writerow([])
    writer.writerow(["STATISTICA", "VALORE"])

    results = {
        "average": float(round(objStat.average(), rounding)),
        "median": float(round(objStat.median(), rounding)),
        "moda": objStat.moda(rounding),
        "variancePopulation": float(round(objStat.variance('p'), rounding)),
        "varianceSample": varianceSample,
        "standardPopulation": float(round(objStat.standard('p'), rounding)),
        "standardSample": standardSample,
        "range": float(round(objStat.range(), rounding)),
        "iqr": iqr
    }

    for key, val in results.items():
        writer.writerow([key, val])

    csv_data = output.getvalue()
    output.close()

    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=statistiche.csv"}
    )

@app.route("/print", methods = ["POST"])
def printPdf():

    data = request.get_json()

    values = data["values"]
    rounding = int(data["rounding"])

    objStat = Statistic(np.array(values))
    iqr = objStat.iqr()
    varianceSample = objStat.variance('s')
    standardSample = objStat.standard('s')

    if type(iqr) != str:
        iqr = float(round(iqr, rounding))

    if type(varianceSample) != str:
        varianceSample = float(round(varianceSample, rounding))
        standardSample = float(round(standardSample, rounding))

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    height = A4[1]

    results = {
        "average": float(round(objStat.average(), rounding)),
        "median": float(round(objStat.median(), rounding)),
        "moda": objStat.moda(rounding),
        "variancePopulation": float(round(objStat.variance('p'), rounding)),
        "varianceSample": varianceSample,
        "standardPopulation": float(round(objStat.standard('p'), rounding)),
        "standardSample": standardSample,
        "range": float(round(objStat.range(), rounding)),
        "iqr": iqr
    }

    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(50, height - 50, "Valori Statistici")

    # Valori
    pdf.setFont("Helvetica", 12)
    y = height - 80
    pdf.drawString(50, y, "VALORI:")
    y -= 20
    for value in values:
        pdf.drawString(70, y, str(value))
        y -= 15

    # Spazio prima delle statistiche
    y -= 20
    pdf.drawString(50, y, "STATISTICA:")
    y -= 20
    for key, val in results.items():
        pdf.drawString(70, y, f"{key}: {val}")
        y -= 15

    pdf.showPage()
    pdf.save()

    pdf_data = buffer.getvalue()
    buffer.close()

    return Response(
        pdf_data,
        mimetype="application/pdf",
        headers={"Content-Disposition": "attachment; filename=statistiche.pdf"}
    )

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)
