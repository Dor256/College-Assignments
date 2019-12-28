import numpy as np
from functions import *
from plots import *
import matplotlib.pyplot as plt
from sklearn import datasets, metrics
import pandas as pd
from Models import LinearRegression, LogisticRegression
from Loss import linear_regression, linear_regression_derivative

Q = np.array([[1, 0], [0, 5]])
IDENTITY_MATRIX = np.array([[1, 0], [0, 1]])
FIRST_VECTOR = np.array([3, 5])
FIRST_CONSTANT = 6
SECOND_VECTOR = np.array([6, 3])
SECOND_CONSTANT = 2


def prepare_boston_data():
    boston_data = datasets.load_boston()
    boston = pd.DataFrame(boston_data.data, columns=boston_data.feature_names)
    boston['TARGET'] = boston_data.target
    boston['ONES'] = 1
    shuffled_boston = boston[['ONES', 'RM', 'LSTAT', 'TARGET']].sample(frac=1)
    return train_test_split(shuffled_boston[['ONES', 'RM', 'LSTAT']], shuffled_boston['TARGET'], 0.8)


def prepare_iris_data():
    iris_data = datasets.load_iris()
    iris = pd.DataFrame(iris_data.data, columns=iris_data.feature_names)
    iris['TARGET'] = iris_data.target
    iris = iris[iris.TARGET != 2]
    shuffled_iris = iris.sample(frac=1)
    class_names = list(filter(lambda name: name != 'virginica', iris_data.target_names))
    return class_names, train_test_split(shuffled_iris[['sepal length (cm)', 'sepal width (cm)', 'petal length (cm)', 'petal width (cm)']], shuffled_iris['TARGET'], 0.8)


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
    trainX, trainY, validationX, validationY = prepare_boston_data()
    # print("======================Full Training Set=========================")
    # model = LinearRegression(trainX, trainY, np.array([0, 0, 0]), 0.001, 1e-5, 1e-12, 'Boston Housing Prices')
    # model.train()
    # prediction = model.evaluate_model(validationX, validationY)
    # mean_sqr_err = (np.linalg.norm(validationY.values - prediction.values) ** 2) / len(validationY)
    # mean_abs_percentage_err = np.mean(np.abs((validationY.values - prediction.values) / validationY.values)) * 100
    # print("Mean Square Error", mean_sqr_err)
    # print("Mean Absolute Percentage Error", mean_abs_percentage_err)

    print("======================K-Fold Iterations (K=5)=========================")
    k = 5
    for i in range(k):
        print("=====Iteration Number " + str(i + 1) + "======")
        k_trainX, k_trainY, k_validationX, k_validationY = k_fold_split(trainX, trainY, k, i + 1)
        model = LinearRegression(k_trainX, k_trainY, np.array([0, 0, 0]), 0.001, 1e-5, 1e-12, 'Boston Housing Prices')
        model.train()
        prediction = model.evaluate_model(k_validationX, k_validationY)
        mean_sqr_err = (np.linalg.norm(k_validationY.values - prediction.values) ** 2) / len(k_validationY)
        mean_abs_percentage_err = np.mean(np.abs((k_validationY.values - prediction.values) / k_validationY.values)) * 100
        print("Mean Square Error", mean_sqr_err)
        print("Mean Absolute Percentage Error", mean_abs_percentage_err)
    # Classification

    # class_names, (trainX, trainY, validationX, validationY) = prepare_iris_data()
    # model = LogisticRegression(trainX, trainY, np.array([0, 0, 0, 0]), 0.05, 1e-5, 1e-12, 'Iris Data')
    # model.train()
    # model.evaluate_model(validationX, validationY)
    # confusion_matrix = metrics.confusion_matrix(validationY.values, np.where(model.predict(validationX).values > 0.97, 1, 0))
    # tn, fp, fn, tp = confusion_matrix.ravel()
    # print('Precision', metrics.precision_score(validationY.values, np.where(model.predict(validationX).values > 0.97, 1, 0)))
    # print('Recall', metrics.recall_score(validationY.values, np.where(model.predict(validationX).values > 0.97, 1, 0)))
    # print('FPR', fp / (fp + tn))
    # fpr, tpr, _ = metrics.roc_curve(validationY.values, np.where(model.predict(validationX).values > 0.97, 1, 0))
    # roc_auc = metrics.auc(fpr, tpr)
    # display = metrics.RocCurveDisplay(fpr=fpr, tpr=tpr, roc_auc=roc_auc, estimator_name='Iris Data')
    # display.plot()
    # plt.show()
    # plot_confusion_matrix(confusion_matrix, class_names, 0.97)