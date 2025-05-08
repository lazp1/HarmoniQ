from flask import Flask, request, jsonify, render_template
import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, roc_auc_score, precision_recall_curve
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from imblearn.over_sampling import SMOTE
from datetime import datetime
from dateutil.relativedelta import relativedelta
from flask_cors import CORS

app = Flask(__name__)

CORS(app, resources={r'/*': {'origins': '*'}})

#Διαχείριση των requests τύπου OPTIONS preflight
@app.before_request
def handle_options_requests():
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = '*'
        response.headers['Access-Control-Allow-Methods'] = '*'
        return response

# Ελέγχος για το model.pkl
model_path = 'model.pkl'
model_exists = os.path.exists(model_path)

if not model_exists:
    # Φόρτωση δεδομένων
    data = pd.read_csv('erevna_IBM.xls')
    X = data[['YearsAtCompany', 'MaritalStatus', 'Gender', 'Over18', 'JobSatisfaction', 'EnvironmentSatisfaction', 'RelationshipSatisfaction', 'DistanceFromHome']]
    y = data['Attrition']

    # Αναγνώριση κατηγορικών και αριθμητικών στηλών
    categorical_columns = X.select_dtypes(include=['object']).columns
    numeric_columns = X.select_dtypes(include=['int64', 'float64']).columns

    # Δημιουργία προεπεξεργαστή
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
        ('onehot', OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore'))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_columns),
            ('cat', categorical_transformer, categorical_columns)
        ])

    # Δημιουργία pipeline
    classifier = LogisticRegression(max_iter=1000, solver='saga', C=0.1)

    # Διαχωρισμός δεδομένων
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

    # Εφαρμογή SMOTE για εξισορρόπηση δεδομένων
    smote = SMOTE(random_state=42)
    X_train_preprocessed = preprocessor.fit_transform(X_train)
    X_train_resampled, y_train_resampled = smote.fit_resample(X_train_preprocessed, y_train)

    # Εκπαίδευση μοντέλου
    classifier.fit(X_train_resampled, y_train_resampled)

    # Πρόβλεψη και αξιολόγηση
    X_test_preprocessed = preprocessor.transform(X_test)
    y_pred = classifier.predict(X_test_preprocessed)
    y_pred_proba = classifier.predict_proba(X_test_preprocessed)[:, 1]
    y_pred_str = np.where(y_pred == 1, 'Yes', 'No')
    print("Ακρίβεια μοντέλου:", accuracy_score(y_test, y_pred_str))
    print("AUC Score:", roc_auc_score(y_test, y_pred_proba, average='macro'))

    # Εύρεση βέλτιστου κατωφλίου
    precision, recall, thresholds = precision_recall_curve(y_test, y_pred_proba, pos_label='Yes')
    f1_scores = 2 * (precision * recall) / (precision + recall)
    optimal_threshold = thresholds[np.argmax(f1_scores[:-1])]  # Αγνοούμε το τελευταίο στοιχείο που μπορεί να είναι NaN
    print("Βέλτιστο κατώφλι:", optimal_threshold)

    # Επαναξιολόγηση με το βέλτιστο κατώφλι
    y_pred_optimal = (y_pred_proba >= optimal_threshold).astype(int)
    y_pred_optimal_str = np.where(y_pred_optimal == 1, 'Yes', 'No')
    print("Ακρίβεια μοντέλου με βέλτιστο κατώφλι:", accuracy_score(y_test, y_pred_optimal_str))

    # Αποθήκευση μοντέλου
    with open('model.pkl', 'wb') as model_file:
        pickle.dump((preprocessor, classifier, optimal_threshold), model_file)
    print("Το μοντέλο αποθηκεύτηκε ως model.pkl")

# Φόρτωση του μοντέλου
with open('model.pkl', 'rb') as model_file:
    preprocessor, classifier, optimal_threshold = pickle.load(model_file)

# Αρχική σελίδα: HTML φόρμα για εισαγωγή δεδομένων
@app.route('/')
def home():
    return render_template('form.html')
    
@app.route('/health')
def health():
    return jsonify("OK")

# Endpoint για πρόβλεψη με POST request
@app.route('/predict', methods=['POST'])
def predict():
    # Λήψη δεδομένων από τη φόρμα ή το POST request
    data = request.get_json() if request.is_json else request.form

    # Δημιουργία DataFrame με τα απαραίτητα χαρακτηριστικά
    new_employee = pd.DataFrame({
        'YearsAtCompany': [data['YearsAtCompany']],
        'JobSatisfaction': [data['JobSatisfaction']],
        'MaritalStatus': [data['MaritalStatus']],
        'Gender': [data['Gender']],
        'EnvironmentSatisfaction': [data['EnvironmentSatisfaction']],
        'RelationshipSatisfaction': [data['RelationshipSatisfaction']],
        'DistanceFromHome': [data['DistanceFromHome']],
        'Over18': [data['Over18']]
    })

    try:
        # Πρόβλεψη
        new_employee_preprocessed = preprocessor.transform(new_employee)
        y_pred_new_proba = classifier.predict_proba(new_employee_preprocessed)[0, 1]

        if y_pred_new_proba >= optimal_threshold:
            result = f"Ο υπάλληλος πιθανώς θα αποχωρήσει. (Πιθανότητα αποχώρησης: {int(y_pred_new_proba * 100)}%)"
        else:
            result = f"Ο υπάλληλος πιθανώς θα παραμείνει. (Πιθανότητα παραμονής: {int((1-y_pred_new_proba) * 100)}%)"
        
        return render_template('result.html', result=result)
        # return jsonify({'prediction': result})
    except Exception as e:
        return render_template('error.html', error=e)
        # return jsonify({'error': f"Σφάλμα κατά την πρόβλεψη: {e}"})

@app.route('/predict', methods=['GET'])
def predict_get():
    return jsonify({'error': 'Το endpoint αυτό δέχεται μόνο POST requests'})

@app.route('/suggestions', methods=['POST'])
def suggestions():
    # Λήψη δεδομένων από το POST request
    data = request.get_json() if request.is_json else request.form
    predictions = []
    for employee in data:
        if(employee['marriedStatus']):
            if employee['marriedStatus'] == 0:
                employee['marriedStatus'] = 'Single'
            elif employee['marriedStatus'] == 1:
                employee['marriedStatus'] = 'Married'
            else:
                employee['marriedStatus'] = 'Divorced'
        
        if(employee['gender']):
            if employee['gender'] == 'male':
                employee['gender'] = 'Male'
            else:
                employee['gender'] = 'Female'
        
        if(employee['hireDate']):
            # Μετατροπή της ημερομηνίας πρόσληψης σε έτη στην εταιρεία

            date_str = employee['hireDate'].split('T')[0]  # Remove everything after 'T'
            hire_date = datetime.strptime(date_str, '%Y-%m-%d')
            # hire_date = datetime.strptime(employee['hireDate'], '%Y-%m-%dT%H:%M:%S')
            current_date = datetime.now()

            # Using relativedelta for more accurate year calculation
            years_at_company = relativedelta(current_date, hire_date).years

            # Alternatively, if you prefer not to use relativedelta
            # years_at_company = (current_date - hire_date).days / 365.25


        
        new_employee = pd.DataFrame({
            'YearsAtCompany': years_at_company,
            'MaritalStatus': [employee['marriedStatus']],
            'Gender': [employee['gender']],
            'Over18': 'Y',
            'JobSatisfaction': [employee['jobSatisfaction']],
            'EnvironmentSatisfaction': [employee['environmentSatisfaction']],
            'RelationshipSatisfaction': [employee['relationshipSatisfaction']],
            'DistanceFromHome': [employee['distanceToWork']],

        })

        try:
            new_employee_preprocessed = preprocessor.transform(new_employee)
            y_pred_new_proba = classifier.predict_proba(new_employee_preprocessed)[0, 1]

            if y_pred_new_proba >= optimal_threshold:
                result = f"Ο υπάλληλος πιθανώς θα αποχωρήσει. (Πιθανότητα αποχώρησης: {int(y_pred_new_proba * 100)}%)"
            else:
                result = f"Ο υπάλληλος πιθανώς θα παραμείνει. (Πιθανότητα παραμονής: {int((1-y_pred_new_proba) * 100)}%)"

            predictions.append({'id': employee['id'], 'prediction': result})
        except Exception as e:
            predictions.append({'id': employee['id'], 'error': f"Σφάλμα κατά την πρόβλεψη: {e}"})

    return jsonify(predictions)

if __name__ == '__main__':
    app.run(debug=True)
