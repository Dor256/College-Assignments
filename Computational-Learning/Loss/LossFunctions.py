import numpy as np
from functions import sigmoid

def linear_regression(x, y):
    n = len(y)
    return lambda w: (sum(((w * x).sum(axis=1) - y) ** 2) / (2 * n), linear_regression_derivative(x, y)(w))


def linear_regression_derivative(x, y):
    n = len(y) 
    return lambda w: ((w * x).sum(axis=1) - y).values.dot(x.values) / len(y)


def logistic_regression(x, y):
    n = len(y)
    return lambda w: (sum(y * np.log(sigmoid((w * x).sum(axis=1))) + (1 - y) * np.log(1 - sigmoid((w * x).sum(axis=1)))) / (-n), logistic_regression_derivative(x, y)(w))


def logistic_regression_derivative(x, y):
    n = len(y)
    return lambda w: ((sigmoid((w * x).sum(axis=1)) - y).values.dot(x.values)) / n