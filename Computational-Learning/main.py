import numpy as np
from functions import *
from plots import *
import matplotlib.pyplot as plt

Q = np.array([[1, 0], [0, 5]])
IDENTITY_MATRIX = np.array([[1, 0], [0, 1]])
FIRST_VECTOR = np.array([3, 5])
FIRST_CONSTANT = 6
SECOND_VECTOR = np.array([6, 3])
SECOND_CONSTANT = 2

def gradient_descent(f, gradient, w0, learning_rate, obj_tol, param_tol, max_iter, title: str = ""):
    w_curr = w0
    w_next = w_curr - learning_rate * gradient(w_curr)
    path = [w_curr, w_next]
    iter_count = 0
    while iter_count < max_iter and np.abs(f(w_next) - f(w_curr)) > obj_tol and np.linalg.norm(np.abs(w_next - w_curr)) > param_tol:
        w_curr = w_next
        w_next = w_curr - learning_rate * gradient(w_curr)
        iter_count += 1
        path = path[:] + [w_next]
        print(title)
        print("Iteration:", iter_count)
        print("Location is:", w_curr)
        print("Objective Value:", f(w_curr))
        print("Step:", np.linalg.norm(np.abs(w_next - w_curr)))
        print("Change in obj value:", np.abs(f(w_next) - f(w_curr)), "\n")
    print("Reached Convergence") if iter_count < max_iter else print("Failed to Converge") 
    return path

if __name__ == "__main__":
    # plot_univar_func(lambda x: sigmoid(x), -10, 10, "Sigmoid")
    # plot_univar_func(univariate_gaussian(1, 1.5), -10, 10, "Univariate Gaussian First mu=1 & sigma=1.5")
    # plot_univar_func(univariate_gaussian(2, 2.5), -10, 10, "Univariate Gaussian Second mu=2 & sigma=2.5")
    # plot_bivar_func(quadratic_function(Q), "Quadratic Q")
    # plot_bivar_func(quadratic_function(IDENTITY_MATRIX), "Quadratic Identity")
    # plot_bivar_func(affine_function(FIRST_VECTOR, FIRST_CONSTANT), "Affine First Vector")
    # plot_bivar_func(affine_function(SECOND_VECTOR, SECOND_CONSTANT), "Affine Second Vector")
    # plot_bivar_func(rosenbrock, "Rosenbrock")
    # points = gradient_descent(quadratic_function(Q), quadratic_derivative(Q), np.array([1, 1]), 0.1, 1e-8, 1e-12, 100, "Quadratic Function Q")
    # points = gradient_descent(quadratic_function(IDENTITY_MATRIX), quadratic_derivative(IDENTITY_MATRIX), np.array([1, 1]), 0.1, 1e-8, 1e-12, 100, "Quadratic Function Identity")
    # points = gradient_descent(affine_function(FIRST_VECTOR, FIRST_CONSTANT), affine_derivative(FIRST_VECTOR, FIRST_CONSTANT), np.array([1, 1]), 0.05, 1e-8, 1e-12, 100, "Affine Function First Vector")
    # points = gradient_descent(affine_function(SECOND_VECTOR, SECOND_CONSTANT), affine_derivative(SECOND_VECTOR, SECOND_CONSTANT), np.array([1, 1]), 0.05, 1e-8, 1e-12, 100, "Affine Function Second Vector")
    points = gradient_descent(rosenbrock, rosenbrock_derivative, np.array([2, 2]), 0.001, 1e-7, 1e-8, 10000, "Rosenbrock Function")
    # plot_gradient_descent_path(quadratic_function(Q), points, "Quadratic Function Q")
    # plot_gradient_descent_path(quadratic_function(IDENTITY_MATRIX), points, "Quadratic Function Identity")
    # plot_gradient_descent_path(affine_function(FIRST_VECTOR, FIRST_CONSTANT), points, "Affine Function First Vector")
    # plot_gradient_descent_path(affine_function(SECOND_VECTOR, SECOND_CONSTANT), points, "Affine Function First Vector")
    plot_gradient_descent_path(rosenbrock, points, "Rosenbrock")