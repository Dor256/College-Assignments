import numpy as np
import pandas as pd
from functions import sigmoid
from Models import Model
from GradientDescent import gradient_descent
from Loss import logistic_regression, logistic_regression_derivative

class LogisticRegression(Model):
    def __init__(self, trainX, trainY, weights, lr, obj_tol, param_tol, model_name: str = 'Logistic Regression'):
        self.trainX = trainX
        self.trainY = trainY
        self.weights = weights
        self.lr = lr
        self.obj_tol = obj_tol
        self.param_tol = param_tol
        self.name = model_name

    def train(self, max_epochs: int = 10000):
        _, self.weights = gradient_descent(
                logistic_regression(self.trainX, self.trainY), 
                logistic_regression_derivative(self.trainX, self.trainY), 
                self.weights, 
                self.lr, 
                self.obj_tol, 
                self.param_tol, 
                max_epochs, 
                self.name
            )

    def predict(self, sample):
        return pd.DataFrame({ 'Prediction': sigmoid(np.dot(sample, self.weights)) }, index=sample.index)