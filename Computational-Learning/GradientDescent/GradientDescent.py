import numpy as np

def gradient_descent(f, gradient, w0, learning_rate, obj_tol, param_tol, max_iter, title: str = ""):
    w_curr = w0
    w_next = w_curr - learning_rate * gradient(w_curr)
    path = [w_curr, w_next]
    iter_count = 0
    while iter_count < max_iter and np.abs(f(w_next)[0] - f(w_curr)[0]) > obj_tol and np.linalg.norm(np.abs(w_next - w_curr)) > param_tol:
        w_curr = w_next
        w_next = w_curr - learning_rate * gradient(w_curr)
        iter_count += 1
        path = path[:] + [w_next]
        # print(title)
        # print("Iteration:", iter_count)
        # print("Location is:", w_curr)
        # print("Objective Value:", f(w_curr))
        # print("Step:", np.linalg.norm(np.abs(w_next - w_curr)))
        # print("Change in obj value:", np.abs(f(w_next)[0] - f(w_curr)[0]), "\n")
    print("Reached Convergence") if iter_count < max_iter else print("Failed to Converge")
    return path, w_next