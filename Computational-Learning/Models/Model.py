import numpy as np
import pandas as pd
from abc import ABC, abstractmethod

class Model(ABC):
    @abstractmethod
    def train(self, max_epochs: int = 10000):
        raise NotImplementedError("Must implement train method!")

    @abstractmethod
    def predict(self, sample):
        raise NotImplementedError("Must implement predict method!")

    def evaluate_model(self, validationX, validationY):
        validation_check = self.predict(validationX)
        validation_diff = pd.DataFrame({ 'Difference': np.abs(validationY.values - validation_check['Prediction'].values) }, index=validationY.index)
        print('PREDICTIONS')
        print(validation_check)
        print('GROUND TRUTH')
        print(validationY)
        print('DIFF')
        print(validation_diff)