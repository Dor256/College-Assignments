import numpy as np
from math import exp, sqrt, e, pi, pow

def sigmoid(x):
    return 1 / (1 + exp(-x))

def univariate_gaussian(mu, sigma):
    return lambda x: (1 / sqrt(2 * pi * sigma**2)) * pow(e, -0.5*(pow((x - mu) / sigma, 2)))

def quadratic_function(matrix):
    return lambda w: (matrix[0][0] * w[0] + matrix[0][1] * w[0])*w[0] + (matrix[1][0] * w[1] + matrix[1][1] * w[1])*w[1]

def quadratic_derivative(matrix):
    return lambda w: np.array([(matrix[0][0] + matrix[0][1]) * 2 * w[0], (matrix[1][0] + matrix[1][1]) * 2 * w[1]])

def affine_function(vector, constant):
    return lambda w: (vector[0] * w[0] + vector[1] * w[1]) + constant

def affine_derivative(vector, constant):
    return lambda w: np.array([vector[0], vector[1]])

def rosenbrok(w):
    return pow((1 - w[0]), 2) + 100 * pow((w[1] - pow(w[0], 2)), 2)

def rosenbrok_derivative(w):
    return np.array([(-400 * w[0]) * (w[1] - pow(w[0], 2)) - 2 * (1 - w[0]), (200 * w[0]) * (w[1] - pow(w[0], 2))])