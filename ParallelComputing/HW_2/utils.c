#include "utils.h"

// Checks if the rank is the master rank
bool isMaster(int rank){
	return rank == MASTER_RANK;
}

// Checks if both numbers are even
bool isSameEvenValue(int num1, int num2){
	return isEven(num1) == isEven(num2);
}

// Checks if a number is even
bool isEven(int num) {
	return num % 2 == 0;
}

// Extracts the direction of the sort
enum SortDirection getSortDirection(int rowCoord, enum MatrixPassBy direction) {
	return direction == COLS ? ASC : getSortDirectionByRows(rowCoord);
}

// Checks if the sort direction is ascending or descending according to row
enum SortDirection getSortDirectionByRows(int rowCoord){
	return isEven(rowCoord) ? ASC : DESC;
}

// Extracts the communication method according to coordination and iteration
enum CommunicationDirection getCommMethod(int iter, enum SortDirection coordAtDirection) {
	return isSameEvenValue(iter, coordAtDirection) ? SEND : REC;
}

// Get the neighbor to exchange according to the communication method
int getNeighborToExchangeWith(int commMethod, int neighbor1, int neighbor2) {
	return commMethod == REC ? neighbor1 : neighbor2;
}