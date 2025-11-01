CC = gcc
CFLAGS = -O2 -Wall -Wextra -pedantic -std=c11 -Isrc
LDFLAGS = -lm

SRC_DIR = src
BIN_DIR = bin
TARGET = $(BIN_DIR)/conicrypt

SOURCES = $(SRC_DIR)/main.c $(SRC_DIR)/conics.c $(SRC_DIR)/ecc.c $(SRC_DIR)/utils.c
OBJECTS = $(SOURCES:.c=.o)

.PHONY: all clean

all: $(TARGET)

$(TARGET): $(OBJECTS)
	@mkdir -p $(BIN_DIR)
	$(CC) $(OBJECTS) -o $(TARGET) $(LDFLAGS)
	@echo "Build complete: $(TARGET)"

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(SRC_DIR)/*.o $(TARGET)
	rm -rf $(BIN_DIR)
	@echo "Clean complete"
