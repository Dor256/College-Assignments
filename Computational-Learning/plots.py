import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from matplotlib import cm

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
    Z = np.array([f(np.array([x, y])) for x, y in zip(X, Y)])
    surf = ax.plot_surface(X, Y, Z, cmap=cm.coolwarm, linewidth=0, antialiased=False)
    fig.colorbar(surf, shrink=0.5, aspect=5)
    plt.show()