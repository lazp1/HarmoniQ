# import pandas as pd
# import numpy as np
# from sklearn.model_selection import train_test_split
# from sklearn.linear_model import LogisticRegression
# from sklearn.metrics import accuracy_score
# from sklearn.preprocessing import OneHotEncoder, StandardScaler
# from sklearn.compose import ColumnTransformer
# from sklearn.pipeline import Pipeline
# from sklearn.impute import SimpleImputer
# import pickle
# import warnings

# # Φόρτωση δεδομένων
# data = pd.read_csv('erevna_IBM.xls')
# X = data.drop('Attrition', axis=1)
# y = data['Attrition']

# # Αναγνώριση κατηγορικών και αριθμητικών στηλών
# categorical_columns = X.select_dtypes(include=['object']).columns
# numeric_columns = X.select_dtypes(include=['int64', 'float64']).columns

# # Δημιουργία προεπεξεργαστή με SimpleImputer για διαχείριση ελλιπών τιμών
# numeric_transformer = Pipeline(steps=[
#     ('imputer', SimpleImputer(strategy='median')),
#     ('scaler', StandardScaler())
# ])

# categorical_transformer = Pipeline(steps=[
#     ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
#     ('onehot', OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore'))
# ])
# warnings.filterwarnings("ignore", category=UserWarning)
# preprocessor = ColumnTransformer(
#     transformers=[
#         ('num', numeric_transformer, numeric_columns),
#         ('cat', categorical_transformer, categorical_columns)
#     ])

# # Δημιουργία pipeline
# model = Pipeline([
#     ('preprocessor', preprocessor),
#     ('classifier', LogisticRegression(max_iter=1000, solver='saga', C=0.1))
# ])

# # Διαχωρισμός δεδομένων και εκπαίδευση μοντέλου
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
# model.fit(X_train, y_train)

# # Πρόβλεψη και αξιολόγηση
# y_pred = model.predict(X_test)
# print("Ακρίβεια μοντέλου:", accuracy_score(y_test, y_pred))

# # Αποθήκευση μοντέλου
# with open('model.pkl', 'wb') as model_file:
#     pickle.dump(model, model_file)
# print("Το μοντέλο αποθηκεύτηκε ως model.pkl")

# # Δοκιμή με λίγα πεδία
# new_employee = pd.DataFrame({
#     'YearsAtCompany': [20],
#     'OverTime': ['Yes'],
#     'JobSatisfaction': [1],
#     'MaritalStatus': ['Single'],
#     'Gender': ['Male']
# })

# # Δημιουργία DataFrame με όλα τα χαρακτηριστικά
# full_employee_data = pd.DataFrame(columns=X.columns)
# for col in X.columns:
#     if col in new_employee.columns:
#         full_employee_data[col] = new_employee[col]
#     else:
#         full_employee_data[col] = np.nan

# # Πρόβλεψη
# try:
#     y_pred_new = model.predict(full_employee_data)
#     print(y_pred_new)
#     if y_pred_new[0] == 'Yes':
#         print("Ο υπάλληλος πιθανώς θα αποχωρήσει.")
#     else:
#         print("Ο υπάλληλος πιθανώς θα παραμείνει.")
# except Exception as e:
#     print(f"Σφάλμα κατά την πρόβλεψη: {e}")
#     print("Προσπαθήστε να παρέχετε περισσότερα χαρακτηριστικά για πιο ακριβή πρόβλεψη.")
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, roc_auc_score, precision_recall_curve
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from imblearn.over_sampling import SMOTE
import pickle
import warnings

warnings.filterwarnings("ignore", category=UserWarning)

# Φόρτωση δεδομένων
data = pd.read_csv('erevna_IBM.xls')
X = data.drop('Attrition', axis=1)
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
model = Pipeline([
    ('preprocessor', preprocessor),
    ('classifier', LogisticRegression(max_iter=1000, solver='saga', C=0.1))
])

# Διαχωρισμός δεδομένων
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Εφαρμογή SMOTE για εξισορρόπηση δεδομένων
smote = SMOTE(random_state=42)
X_train_preprocessed = preprocessor.fit_transform(X_train)
X_train_resampled, y_train_resampled = smote.fit_resample(X_train_preprocessed, y_train)

# Εκπαίδευση μοντέλου
classifier = LogisticRegression(max_iter=1000, solver='saga', C=0.1)
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

# Δοκιμή με λίγα πεδία
new_employee = pd.DataFrame({
    'YearsAtCompany': [3],
    'OverTime': ['No'],
    'JobSatisfaction': [3],
    'MaritalStatus': ['Single'],
    'Gender': ['Female']
})

# Δημιουργία DataFrame με όλα τα χαρακτηριστικά
full_employee_data = pd.DataFrame(columns=X.columns)
for col in X.columns:
    if col in new_employee.columns:
        full_employee_data[col] = new_employee[col]
    else:
        full_employee_data[col] = np.nan

# Πρόβλεψη
try:
    new_employee_preprocessed = preprocessor.transform(full_employee_data)
    y_pred_new_proba = classifier.predict_proba(new_employee_preprocessed)[0, 1]
    if y_pred_new_proba >= optimal_threshold:
        print(f"Ο υπάλληλος πιθανώς θα αποχωρήσει. (Πιθανότητα: {y_pred_new_proba:.2f})")
    else:
        print(f"Ο υπάλληλος πιθανώς θα παραμείνει. (Πιθανότητα παραμονής: {1-y_pred_new_proba:.2f})")
except Exception as e:
    print(f"Σφάλμα κατά την πρόβλεψη: {e}")
    print("Προσπαθήστε να παρέχετε περισσότερα χαρακτηριστικά για πιο ακριβή πρόβλεψη.")
