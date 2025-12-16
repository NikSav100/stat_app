import math
import numpy as np

class Statistic:
    def __init__(self, values):
        self.__values = np.sort(values)
        self.__length = len(values)

    def average(self):
        return sum(self.__values) / self.__length
    
    def median(self):
        if self.__length % 2:
            return self.__values[int(((self.__length + 1) / 2)) - 1]
        else:
            temp = Statistic(np.array([self.__values[(int(self.__length / 2)) - 1], self.__values[(int(self.__length / 2) + 1) - 1]]))
            return temp.average()
        
    def moda(self, rounding):
        temp = list(self.__values)
        moda = set()
        max = 0
        for value in temp:
            counter = temp.count(value)
            if counter > max:
                max = counter
                moda.clear()
                moda.add(float(round(value, rounding)))
            elif counter == max:
                moda.add(float(round(value, rounding)))

        moda = list(moda)
        moda.sort()

        return moda if max > 1 else []
    
    def variance(self, type):
        avg = self.average()
        temp = [pow(value - avg, 2) for value in self.__values]

        if (type == 'p'):
            return sum(temp) / len(temp)
        else:
            return "NULL" if len(temp) < 2 else sum(temp) / (len(temp) - 1)
        
    def standard(self, type):
        return "NULL" if (self.__length < 2 and type == 's') else math.sqrt(self.variance(type))

    def range(self):
        return max(list(self.__values)) - min(list(self.__values))
    
    def iqr(self):
        if self.__length < 4:
            return "NULL"

        data = sorted(self.__values)
        n = self.__length

        # Percentile esclusivo (Excel PERCENTILE.EXC)
        def percentile_exc(p):
            pos = p * (n + 1)
            if pos <= 1:
                return data[0]
            if pos >= n:
                return data[-1]

            i = int(pos)
            f = pos - i
            return data[i - 1] + f * (data[i] - data[i - 1])

        q1 = percentile_exc(0.25)
        q3 = percentile_exc(0.75)
        return q3 - q1
