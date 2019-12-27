import numpy as np
from functions import *
from plots import *
import matplotlib.pyplot as plt
import pandas as pd

Q = np.array([[1, 0], [0, 5]])
IDENTITY_MATRIX = np.array([[1, 0], [0, 1]])
FIRST_VECTOR = np.array([3, 5])
FIRST_CONSTANT = 6
SECOND_VECTOR = np.array([6, 3])
SECOND_CONSTANT = 2

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


boston_data = skd.load_boston()

boston = pd.DataFrame(boston_data.data, columns=boston_data.feature_names)
boston['TARGET'] = boston_data.target
boston['ONES'] = 1
# print(boston.head())
shuffled_boston = boston[['ONES', 'RM', 'LSTAT', 'TARGET']].sample(frac=1)

trainX, trainY, validationX, validationY = train_test_split(shuffled_boston[['ONES', 'RM', 'LSTAT']], shuffled_boston['TARGET'], 0.8)


def gradient_descent(f, gradient, w0, learning_rate, obj_tol, param_tol, max_iter, x, y, title: str = ""):
    w_curr = w0
    print(w_curr)
    w_next = w_curr - learning_rate * gradient(w_curr, x, y)
    path = [w_curr, w_next]
    iter_count = 0
    while iter_count < max_iter and np.abs(f(w_next, x, y)[0] - f(w_curr, x, y)[0]) > obj_tol and np.linalg.norm(np.abs(w_next - w_curr)) > param_tol:
        w_curr = w_next
        w_next = w_curr - learning_rate * gradient(w_curr, x, y)
        iter_count += 1
        path = path[:] + [w_next]
        print(title)
        print("Iteration:", iter_count)
        print("Location is:", w_curr)
        print("Objective Value:", f(w_curr, x, y))
        print("Step:", np.linalg.norm(np.abs(w_next - w_curr)))
        print("Change in obj value:", np.abs(f(w_next, x, y)[0] - f(w_curr, x, y)[0]), "\n")
    print("Reached Convergence") if iter_count < max_iter else print("Failed to Converge") 
    return path, w_next


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
    # points = gradient_descent(rosenbrock, rosenbrock_derivative, np.array([2, 2]), 0.001, 1e-7, 1e-8, 10000, "Rosenbrock Function")
    # plot_gradient_descent_path(quadratic_function(Q), points, "Quadratic Function Q")
    # plot_gradient_descent_path(quadratic_function(IDENTITY_MATRIX), points, "Quadratic Function Identity")
    # plot_gradient_descent_path(affine_function(FIRST_VECTOR, FIRST_CONSTANT), points, "Affine Function First Vector")
    # plot_gradient_descent_path(affine_function(SECOND_VECTOR, SECOND_CONSTANT), points, "Affine Function First Vector")
    # plot_gradient_descent_path(rosenbrock, points, "Rosenbrock")

    path, weights = gradient_descent(linear_regression, linear_regression_derivative, np.array([0, 0, 0]), 0.001, 1e-5, 1e-12, 10000, trainX, trainY)
    validation_check = np.dot(validationX, weights)
    validation_diff = np.abs(validationY - validation_check)
    print('CHECK')
    print(validation_check)
    print('ACTUAL')
    print(validationY)
    print('DIFF')
    print(validation_diff)

    # print(linear_regression(np.array([1, 1]), np.array([5, 6]), np.array([3, 4])))
    # print(logistic_regression(np.array([1, 1]), np.array([5, 6]), np.array([3, 4])))