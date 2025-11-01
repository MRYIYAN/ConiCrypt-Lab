CC = gcc
CFLAGS = -Wall -Wextra -O2 -std=c99 -lm
SRC_DIR = src
BIN_DIR = bin
OBJ_DIR = obj

SOURCES = $(SRC_DIR)/main.c $(SRC_DIR)/conics.c $(SRC_DIR)/ecc.c $(SRC_DIR)/utils.c
OBJECTS = $(SOURCES:$(SRC_DIR)/%.c=$(OBJ_DIR)/%.o)
TARGET = $(BIN_DIR)/conicrypt

.PHONY: all clean

all: $(TARGET)

$(TARGET): $(OBJECTS) | $(BIN_DIR)
	$(CC) $(OBJECTS) -o $@ $(CFLAGS)

$(OBJ_DIR)/%.o: $(SRC_DIR)/%.c | $(OBJ_DIR)
	$(CC) -c $< -o $@ $(CFLAGS)

$(BIN_DIR):
	mkdir -p $(BIN_DIR)

$(OBJ_DIR):
	mkdir -p $(OBJ_DIR)

clean:
	rm -rf $(BIN_DIR) $(OBJ_DIR)
