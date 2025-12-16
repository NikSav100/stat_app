# Statistical Flask App

This web application allows you to calculate statistics on a set of numerical values, export the results to CSV and PDF, and visualize graphs like the Gaussian curve. It is built with Flask, NumPy, and ReportLab. Features include calculation of mean, median, mode, variance, standard deviation, range, and IQR, with options to export results and a simple web interface for inputting values. The project uses Python 3, Flask, NumPy, ReportLab, and Gunicorn.

Project structure:

my-flask-app/
├── app.py
├── requirements.txt
├── Procfile
├── templates/
├── static/
└── .gitignore

Local installation and run:

git clone [https://github.com/your-username/my-flask-app.git](https://github.com/NikSav100/stat_app.git)
cd stat_app
python -m venv venv

# Windows

venv\Scripts\activate

# Mac/Linux

source venv/bin/activate
pip install -r requirements.txt
python app.py

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser. To use the app, enter numerical values in the form on the home page, select the number of decimal places for rounding, click **Calculate** to see the statistics, and optionally export the data in CSV or PDF format.

Author: Nicola Savastano
