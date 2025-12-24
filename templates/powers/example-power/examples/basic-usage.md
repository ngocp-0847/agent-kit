# Basic Usage Examples

This file contains practical examples of using the Example Power tools.

## Example 1: Echo Tool

The simplest tool - returns input unchanged.

### Basic Echo

```
Input: { "text": "Hello, Kiro!" }

Output:
{
  "success": true,
  "result": "Hello, Kiro!",
  "timestamp": "2024-12-23T10:00:00.000Z"
}
```

### Echo with Special Characters

```
Input: { "text": "Hello! @#$% 123" }

Output:
{
  "success": true,
  "result": "Hello! @#$% 123",
  "timestamp": "2024-12-23T10:00:00.000Z"
}
```

## Example 2: Transform Tool

Transform text using various operations.

### Uppercase

```
Input: { "text": "hello world", "operation": "uppercase" }

Output:
{
  "success": true,
  "operation": "uppercase",
  "input": "hello world",
  "result": "HELLO WORLD",
  "timestamp": "2024-12-23T10:00:00.000Z"
}
```

### Lowercase

```
Input: { "text": "HELLO WORLD", "operation": "lowercase" }

Output:
{
  "success": true,
  "operation": "lowercase",
  "input": "HELLO WORLD",
  "result": "hello world",
  "timestamp": "2024-12-23T10:00:00.000Z"
}
```

### Reverse

```
Input: { "text": "Hello", "operation": "reverse" }

Output:
{
  "success": true,
  "operation": "reverse",
  "input": "Hello",
  "result": "olleH",
  "timestamp": "2024-12-23T10:00:00.000Z"
}
```

### Length

```
Input: { "text": "Hello World", "operation": "length" }

Output:
{
  "success": true,
  "operation": "length",
  "input": "Hello World",
  "result": "11",
  "timestamp": "2024-12-23T10:00:00.000Z"
}
```

## Example 3: Analyze Tool

Get statistics about text content.

### Simple Text

```
Input: { "text": "Hello World" }

Output:
{
  "success": true,
  "statistics": {
    "wordCount": 2,
    "lineCount": 1,
    "characterCount": 11,
    "characterCountNoSpaces": 10
  },
  "timestamp": "2024-12-23T10:00:00.000Z"
}
```

### Multi-line Text

```
Input: { "text": "Line one\nLine two\nLine three" }

Output:
{
  "success": true,
  "statistics": {
    "wordCount": 6,
    "lineCount": 3,
    "characterCount": 28,
    "characterCountNoSpaces": 24
  },
  "timestamp": "2024-12-23T10:00:00.000Z"
}
```

### Empty Text

```
Input: { "text": "" }

Output:
{
  "success": true,
  "statistics": {
    "wordCount": 0,
    "lineCount": 1,
    "characterCount": 0,
    "characterCountNoSpaces": 0
  },
  "timestamp": "2024-12-23T10:00:00.000Z"
}
```

## Example 4: Combined Workflow

Using multiple tools together.

### Workflow: Analyze, Transform, Verify

```
Step 1: Analyze original text
Input: { "text": "hello world from kiro" }
Result: { wordCount: 4, characterCount: 21 }

Step 2: Transform to uppercase
Input: { "text": "hello world from kiro", "operation": "uppercase" }
Result: "HELLO WORLD FROM KIRO"

Step 3: Verify with echo
Input: { "text": "HELLO WORLD FROM KIRO" }
Result: "HELLO WORLD FROM KIRO"
```

### Workflow: Check Palindrome

```
Step 1: Get original text
Input: { "text": "racecar" }

Step 2: Reverse the text
Input: { "text": "racecar", "operation": "reverse" }
Result: "racecar"

Step 3: Compare - if original equals reversed, it's a palindrome!
"racecar" === "racecar" → true (palindrome!)
```

## Error Examples

### Invalid Operation

```
Input: { "text": "hello", "operation": "invalid" }

Error:
{
  "error": "Unknown operation: invalid"
}
```

### Missing Required Parameter

```
Input: { "operation": "uppercase" }
// Missing "text" parameter

Error:
{
  "error": "Missing required parameter: text"
}
```

## Tips for Using These Tools

1. **Start with Echo**: Verify the server is responding correctly
2. **Use Analyze First**: Understand your text before transforming
3. **Chain Operations**: Combine tools for complex workflows
4. **Check Results**: Use echo to verify transformations

## Common Use Cases

| Use Case | Tool | Operation |
|----------|------|-----------|
| Test connectivity | echo | - |
| Format for display | transform | uppercase/lowercase |
| Create slug | transform | lowercase + custom |
| Count content | analyze | - |
| Verify data | echo | - |
| Check length | transform | length |
