import matplotlib.pyplot as plt
import numpy as np
from mpl_toolkits.mplot3d import Axes3D
from matplotlib import cm
from math import log, cos, sin, exp, sqrt, e, pi, pow

Q = np.array([[1, 0], [0, 5]])
IDENTITY_MATRIX = np.array([[1, 0], [0, 1]])
FIRST_VECTOR = np.array([3, 5])
FIRST_CONSTANT = 6
SECOND_VECTOR = np.array([6, 3])
SECOND_CONSTANT = 2

def sigmoid(x):
    return 1 / (1 + exp(-x))

def univariate_gaussian(mu, sigma):
    return lambda x: (1 / sqrt(2 * pi * sigma**2)) * pow(e, -0.5*(pow((x - mu) / sigma, 2)))

def quadratic_function(matrix):
    return lambda w0, w1: (matrix[0][0] * w0 + matrix[0][1] * w0)*w0 + (matrix[1][0] * w1 + matrix[1][1] * w1)*w1

def affine_function(vector, constant):
    return lambda w0, w1: (vector[0] * w0 + vector[1] * w1) + constant

def plot_univar_func(f: staticmethod, x_min: int, x_max: int):
    x_values = [x for x in range(x_min, x_max)]
    y_values = [f(x) for x in x_values]
    plt.plot(x_values, y_values)
    plt.ylabel('some numbers')
    plt.show()

def plot_bivar_func(f: staticmethod, x_min: int, x_max: int, y_min: int, y_max: int):
    fig = plt.figure()
    ax = fig.gca(projection='3d')
    X = np.arange(x_min, x_max, 0.25)
    Y = np.arange(y_min, y_max, 0.25)
    X, Y = np.meshgrid(X, Y)
    Z = np.array([f(x, y) for x, y in zip(X, Y)])
    surf = ax.plot_surface(X, Y, Z, cmap=cm.coolwarm, linewidth=0, antialiased=False)
    fig.colorbar(surf, shrink=0.5, aspect=5)
    plt.show()

def gradient_descent(f, gradient, w0, learning_rate, obj_tol, param_tol, max_iter):
    w_curr = w0
    w_next = w_curr - learning_rate * gradient(w_curr)
    iter_count = 0
    while iter_count < max_iter and np.abs(f(w_next) - f(w_curr)) > obj_tol and np.linalg.norm(np.abs(w_next - w_curr)) > param_tol:
        w_curr = w_next
        w_next = w_curr - learning_rate * gradient(w_curr)
        iter_count += 1
        print("Iteration:", iter_count)
        print("Location is:", w_curr)
        print("Objective Value:", f(w_curr))
        print("Step:", np.linalg.norm(np.abs(w_next - w_curr)))
        print("Change in obj value:", np.abs(f(w_next) - f(w_curr)), "\n")
    if iter_count < max_iter:
        print("Reached Convergence")
        return w_curr

if __name__ == "__main__":
    # plot_univar_func(lambda x: sigmoid(x), -10, 10)
    # plot_univar_func(univariate_gaussian(1, 1.5), -10, 10)
    # plot_bivar_func(quadratic_function(Q), -10, 10, -10, 10)
    # plot_bivar_func(quadratic_function(IDENTITY_MATRIX), -10, 10, -10, 10)
    # plot_bivar_func(affine_function(FIRST_VECTOR, FIRST_CONSTANT), -10, 10, -10, 10)
    plot_bivar_func(affine_function(SECOND_VECTOR, SECOND_CONSTANT), -10, 10, -10, 10)
    # gradient_descent(lambda x: 2*(x[0]*2)*cos(x[0]) - 5*x[0], lambda x: np.array(2 * (2*x[0]*cos(x[0]) - (x**2 * sin(x[0]))) - 5), np.array([-1]), 0.05, 1e-8, 1e-12, 1000000)
