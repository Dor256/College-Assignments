import numpy as np
from math import exp, sqrt, e, pi, pow

def sigmoid(x):
    return 1 / (1 + np.exp(-x))


def univariate_gaussian(mu, sigma):
    return lambda x: (1 / sqrt(2 * pi * sigma**2)) * pow(e, -0.5*(pow((x - mu) / sigma, 2)))


def quadratic_function(matrix):
    return lambda w: (matrix[0][0] * w[0] + matrix[0][1] * w[0])*w[0] + (matrix[1][0] * w[1] + matrix[1][1] * w[1])*w[1]


def quadratic_derivative(matrix):
    return lambda w: np.array([(matrix[0][0] + matrix[0][1]) * 2 * w[0], (matrix[1][0] + matrix[1][1]) * 2 * w[1]])


def affine_function(vector, constant):
    return lambda w: (vector[0] * w[0] + vector[1] * w[1]) + constant


def affine_derivative(vector, constant):
    return lambda w: vector


def rosenbrock(w):
    return (1 - w[0]) ** 2 + 100 * (w[1] - w[0] ** 2) ** 2


def rosenbrock_derivative(w):
    return np.array([(-400 * w[0]) * (w[1] - (w[0] ** 2)) - 2 * (1 - w[0]), (200 * w[0]) * (w[1] - (w[0] ** 2))])


def linear_regression(w, x, y):
    n = len(y)
    loss = sum((((w * x) - y) ** 2)) / (2 * n)
    return loss, linear_regression_derivative(w, x, y)


def linear_regression_derivative(w, x, y):
    n = len(y)
    gradient = ((w * x) - y) * x / n
    return gradient


def logistic_regression(w, x, y):
    n = len(y)
    loss = sum(y * np.log(sigmoid(w * x)) + (1 - y) * np.log(1 - sigmoid(w * x))) / (-n)
    return loss, logistic_regression_derivative(w, x, y)


def logistic_regression_derivative(w, x, y):
    return sigmoid(w * x) * x


def train_test_split(x, y, ratio):
    n = len(x)
    test_count = int(n * ratio)
    return x[:test_count], y[:test_count], x[test_count:], y[test_count:]


def k_fold_split(x, y, k, split_num):
    parts_count = int(len(x) / k)

    validation_from = (split_num - 1) * parts_count
    validation_to = split_num * parts_count

    first_train_from = 0
    first_train_to = validation_from

    second_train_from = validation_to
    second_train_to = len(x)

    cur_fold_x_train = np.append(x[first_train_from:first_train_to], x[second_train_from:second_train_to])
    cur_fold_y_train = np.append(y[first_train_from:first_train_to], y[second_train_from:second_train_to])
    cur_fold_x_validation = x[validation_from:validation_to]
    cur_fold_y_validation = y[validation_from:validation_to]

    return cur_fold_x_train, cur_fold_y_train, cur_fold_x_validation, cur_fold_y_validation

