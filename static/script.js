const btnCalc = $("#btnCalc")
const btnReset = $('#btnReset')
const btnExample = $('#btnExample')
const btnExport = $("#btnExport")
const btnPrint = $("#btnPrint")

const txtValues = $("#txtValues")
const txtNumElements = $("#txtNumElements")

const msgWarnings = $("#msgWarnings")

const radioSample = $("#campione")
const radioPopulation = $("#popolazione")

const selectRound = $("#arrotondamento")

const labelVariance = $("#labelVariance")
const labelStandard = $("#labelStandard")
const symbolVariance = $("#symbolVariance")

const avgValue = $("#avgValue")
const medianValue = $("#medianValue")
const modaValue = $("#modaValue")
const varianceValue = $("#varianceValue")
const standardValue = $("#standardValue")
const rangeValue = $("#rangeValue")
const iqrValue = $("#iqrValue")

let varianceType = 1

let variancePopulation = 2.00
let varianceSample = 2.50
let standardPopulation = 1.41
let standardSample = 1.58

let gaussianChart

msgWarnings.text("Inserisci un set di dati valido!")

const isValidNumberList = input => {
    if (typeof input !== "string") return false;

    const parts = input.split(',').map(s => s.trim());
    if (parts.length === 0) return false;
    if (parts.some(p => p === "")) return false; // previene "1,,2"

    return parts.every(p => {
        // accetta numeri interi o decimali con almeno una cifra dopo il punto
        // NON accetta 1. (decimale senza cifra)
        return /^-?\d+(\.\d+)?$/.test(p) && isFinite(Number(p));
    });
}

const getValues = text => {

    values = []
    txtNum = ""

    for (let i = 0; i < text.length; i++) {
        if (text[i] != ' ') {
            if (text[i] != ',') {
                txtNum += text[i]
            } else {
                values.push(+txtNum)
                txtNum = ""
            }
        }
    }

    if (txtNum.length > 0) {
        values.push(+txtNum)
    }

    return values

}

const getModa = moda => {
    let lengthModa = moda.length
    if (!lengthModa) return "NULL"
    else if (lengthModa > 1) {
        strModa = '['
        for (let i = 0; i < lengthModa; i++) {
            strModa += String(moda[i])
            if (i < lengthModa - 1) strModa += ','
        }
        strModa += ']'
        return strModa;
    } else return moda
}

const setVariance = () => {

    switch (varianceType) {
        case 1:
            labelVariance.html("Varianza")
            symbolVariance.html("σ²")
            varianceValue.html(variancePopulation)
            break;
        case 2:
            labelVariance.html("Varianza campionaria")
            symbolVariance.html("s²")
            varianceValue.html(varianceSample)
            break;
    }


}

const setStandard = () => {

    switch (varianceType) {
        case 1:
            labelStandard.html("Deviazione standard")
            standardValue.html(standardPopulation)
            break;
        case 2:
            labelStandard.html("Deviazione standard campionaria")
            standardValue.html(standardSample)
            break;
    }

}

const gaussian = (x, average, standard) => {
    return (1 / (standard * Math.sqrt(2 * Math.PI))) *
         Math.exp(-0.5 * Math.pow((x - average) / standard, 2));
}

const drawGaussChart = (average, standard) => {

    if (gaussianChart) {
        gaussianChart.destroy()
    }

    const nPoints = 400; // numero fisso di punti
    const xStart = average - 4*standard;
    const xEnd = average + 4*standard;
    const step = (xEnd - xStart) / nPoints;

    const xValues = [];
    for (let i = 0; i <= nPoints; i++) {
        xValues.push(xStart + i*step);
    }

    const gaussPoints = xValues.map(x => ({
        x: x,
        y: gaussian(x, average, standard)
    }));

    gaussianChart = new Chart(document.getElementById('gaussChart'), {

        type: 'line',
        data: {
            datasets: [{
                label: 'Curva di Gauss',
                data: gaussPoints,
                borderColor: 'blue',
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0.3
            }]
          },
        options: {
            scales: {
                x: { type: 'linear', title: { display: true, text: 'x' } },
                y: { title: { display: true, text: 'f(x)' } }
            }
        }

    })

}


btnReset.on('click', () => {

    txtValues.val("")
    avgValue.html("NULL")
    medianValue.html("NULL")
    modaValue.html("NULL")
    varianceValue.html("NULL")
    standardValue.html("NULL")
    rangeValue.html("NULL")
    iqrValue.html("NULL")

    txtNumElements.text(0)

    variancePopulation = "NULL"
    varianceSample = "NULL"
    standardPopulation = "NULL"
    standardSample = "NULL"

    if (gaussianChart) {
        gaussianChart.destroy()
    }


})

btnExample.on('click', () => {

    strValues = ""
    const numbers = []

    for (let i = 0; i < 5; i++) {
        numbers[i] = Math.floor(Math.random() * 10)
        strValues += String(numbers[i])
        if (i < 4)
            strValues += ','
    }

    txtValues.val(strValues)
    msgWarnings.css("display", "none")


    $.ajax({
        type: "POST",
        url: "/calculate",
        contentType: "application/json",
        data: JSON.stringify({ values: numbers, rounding: selectRound.val() }),
        dataType: "json",
        success: function (response) {
            if (response.success) {

                avgValue.html(response.average)
                medianValue.html(response.median)
                modaValue.html(getModa(response.moda))
                standardValue.html(response.standard)
                rangeValue.html(response.range)
                iqrValue.html(response.iqr)

                variancePopulation = response.variancePopulation
                varianceSample = response.varianceSample
                standardPopulation = response.standardPopulation
                standardSample = response.standardSample

                setVariance()
                setStandard()

                drawGaussChart(response.average, response.standardPopulation)

            }
        }
    });

})

btnCalc.on("click", () => {

    if (!isValidNumberList(txtValues.val())) {
        msgWarnings.css("display", "block")
    } else {
        msgWarnings.css("display", "none")
        data = getValues(txtValues.val())
        txtNumElements.text(data.length)

        $.ajax({
            type: "POST",
            url: "/calculate",
            contentType: "application/json",
            data: JSON.stringify({ values: data, rounding: selectRound.val() }),
            dataType: "json",
            success: function (response) {
                if (response.success) {

                    avgValue.html(response.average)
                    medianValue.html(response.median)
                    modaValue.html(getModa(response.moda))
                    standardValue.html(response.standard)
                    rangeValue.html(response.range)
                    iqrValue.html(response.iqr)

                    variancePopulation = response.variancePopulation
                    varianceSample = response.varianceSample
                    standardPopulation = response.standardPopulation
                    standardSample = response.standardSample

                    setVariance()
                    setStandard()

                    drawGaussChart(response.average, response.standardPopulation)



                }
            }
        });

    }


})

btnPrint.on("click", () => {

    if (!isValidNumberList(txtValues.val())) {
        msgWarnings.css("display", "block")
    } else {
        msgWarnings.css("display", "none")
        data = getValues(txtValues.val())

        $.ajax({
            type: "POST",
            url: "/print",
            contentType: "application/json",
            data: JSON.stringify({ values: data, rounding: selectRound.val() }),
             xhrFields: {
                responseType: 'blob'   // <- importante per ricevere il file
            },
            success: blob => {
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = "statistiche.pdf"// nome del file
                document.body.appendChild(a)
                a.click()
                a.remove()
                window.URL.revokeObjectURL(url)
            }
        });

    }


})

btnExport.on("click", () => {
    
    if (!isValidNumberList(txtValues.val())) {
        msgWarnings.css("display", "block")
    } else {
        msgWarnings.css("display", "none")
        data = getValues(txtValues.val())

        $.ajax({
            type: "POST",
            url: "/exportcsv",
            contentType: "application/json",
            data: JSON.stringify({ values: data, rounding: selectRound.val() }),
             xhrFields: {
                responseType: 'blob'   // <- importante per ricevere il file
            },
            success: blob => {
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = "statistiche.csv"// nome del file
                document.body.appendChild(a)
                a.click()
                a.remove()
                window.URL.revokeObjectURL(url)
            }
        });

    }

})

txtValues.on("click", () => {
    msgWarnings.css("display", "none")
})


radioSample.on("change", () => {
    if (radioSample.prop("checked")) {
        varianceType = 2
        setVariance()
        setStandard()
    }
})

radioPopulation.on("change", () => {
    if (radioPopulation.prop("checked")) {
        varianceType = 1
        setVariance()
        setStandard()
    }
})


//values when page is open
txtValues.val("3,4,4,6,7")