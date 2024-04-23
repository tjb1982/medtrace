BUILD_DIR := ./dist
SRC_DIR := ./src
SRCS := $(shell find $(SRC_DIR) -name '*.ts')
OBJS := $(SRCS:$(SRC_DIR)/%.ts=$(BUILD_DIR)/%.js) $(BUILD_DIR)/index.html
HTML_SRCS := $(shell find $(SRC_DIR) -name '*.html')

all: $(OBJS)

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

# Compile the ts files individually
$(BUILD_DIR)/%.js: $(SRC_DIR)/%.ts ./node_modules
	mkdir -p $(dir $@)
	npx swc $< -o $@

# bundle all the templates into $(BUILD_DIR)/index.html
$(BUILD_DIR)/index.html: export TEMPLATES = $(shell cat $(HTML_SRCS))
$(BUILD_DIR)/index.html: $(HTML_SRCS) $(BUILD_DIR) ./index.template.html
	cat ./index.template.html | envsubst '$$TEMPLATES' | tr -d '\n' | sed -r 's/\s+/ /g' > $@

./node_modules:
	npm install

serve: all
	npx serve -s $(BUILD_DIR)

clean:
	rm -rf $(BUILD_DIR) ./node_modules

.PHONY: all clean serve