import pandas as pd

from keras import layers, optimizers, regularizers
from keras.layers import Dense, Dropout, BatchNormalization, Activation
from keras.models import Sequential

from sklearn import preprocessing, model_selection

data = pd.read_csv("./winequality-red.csv")
data["quality"] = data["quality"].astype(object)

data["quality"] = data["quality"].astype(int)
data = pd.get_dummies(data, columns=["quality"])

X = data.iloc[:,0:11].values # first columns
Y = data.iloc[:,12:].values # last columns

X = preprocessing.normalize(X, axis = 0)

X_train,X_test,Y_train,Y_test = model_selection.train_test_split(X, Y, test_size=0.2)

print(X_train.shape,Y_train.shape,X_test.shape,Y_test.shape)

model = Sequential()
# layer 1
model.add(Dense(30, input_dim=11, activation='relu', name='fully_connected0', kernel_regularizer=regularizers.l2(0.01)))
model.add(BatchNormalization())
#layer 2
model.add(Dense(50, name='fully_connected1'))
model.add(BatchNormalization())
model.add(Activation('tanh'))
model.add(Dropout(0.5))
#layer 3
model.add(Dense(100, name='fully_connected2'))
model.add(BatchNormalization())
model.add(Activation('relu'))
model.add(Dropout(0.5))
#layer 4
model.add(Dense(5, name='fully_connected3'))
model.add(BatchNormalization())
model.add(Activation('softmax'))

print(model.summary())

adam = optimizers.Adam(lr=0.001, epsilon=1e-08, decay=0.0)
model.compile(optimizer=adam, loss="categorical_crossentropy", metrics=["categorical_accuracy"])

model.fit(x=X_train, y=Y_train, epochs=200, verbose=1, batch_size=64, validation_data=(X_test, Y_test))

preds = model.evaluate(x=X_test, y=Y_test)
print()
print ("Loss = " + str(preds[0]))
print ("Test Accuracy = " + str(preds[1]))


# We used a 4 layer Neural Network, we found that using a hyperbolic tangent for the second layer yields the best results.

# We used Softmax for the final activation function as per multi-class classification.

# We added Batch Normalization in order to normalize the inputs that enter into each one of the hidden layers, we found that this approach improved the results.
# Batch Normalization also allows us to use less Dropout, thus lowering the amount of information lost.

# We used Dropout on our layers to prevent overfitting of the model.
# The data is relatively simply and thus a complex model might perform worse than a simple one eg. Logistic Regression.

# The score data is not distributed very well amongst the wines, a more varied distribution might benefit a modle such as this.
