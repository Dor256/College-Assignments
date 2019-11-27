import numpy as np
from math import log
from functions import *
from plots import *

Q = np.array([[1, 0], [0, 5]])
IDENTITY_MATRIX = np.array([[1, 0], [0, 1]])
FIRST_VECTOR = np.array([3, 5])
FIRST_CONSTANT = 6
SECOND_VECTOR = np.array([6, 3])
SECOND_CONSTANT = 2

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
    # plot_bivar_func(affine_function(SECOND_VECTOR, SECOND_CONSTANT), -10, 10, -10, 10)
    # gradient_descent(quadratic_function(Q), quadratic_derivative(Q), np.array([1, 1]), 0.1, 1e-8, 1e-12, 100)
    # gradient_descent(affine_function(FIRST_VECTOR, FIRST_CONSTANT), affine_derivative(FIRST_VECTOR, FIRST_CONSTANT), np.array([1, 1]), 0.05, 1e-8, 1e-12, 100)
    gradient_descent(rosenbrok, rosenbrok_derivative, np.array([2, 2]), 0.001, 1e-7, 1e-8, 10000)
