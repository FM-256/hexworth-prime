/* ============================================================
   CHALLENGE ENGINE — Per-Language Coding Challenges
   Code Armory | House of Code | Hexworth Prime
   ============================================================ */
var ChallengeEngine = (function() {
    'use strict';

    var STORAGE_KEY = 'hexworth_challenge_progress';

    var CHALLENGES = [
        // ---- Python (5) ----
        { id: 'py-01', title: 'FizzBuzz', lang: 'python', difficulty: 'beginner', points: 10,
          description: 'Write a function that prints numbers 1-20. For multiples of 3 print "Fizz", for multiples of 5 print "Buzz", for both print "FizzBuzz".',
          starter: 'def fizzbuzz():\n    for i in range(1, 21):\n        # Your code here\n        pass\n\nfizzbuzz()',
          expected: 'FizzBuzz',
          patterns: ['if.*%.*3', 'if.*%.*5', 'FizzBuzz', 'Fizz', 'Buzz', 'range'],
          hints: ['Use the modulo operator (%) to check divisibility', 'Check for divisibility by 15 (both 3 and 5) first', 'Use elif to chain your conditions'] },
        { id: 'py-02', title: 'Reverse String', lang: 'python', difficulty: 'beginner', points: 10,
          description: 'Write a function that takes a string and returns it reversed without using slicing or reversed().',
          starter: 'def reverse_string(s):\n    # Your code here\n    pass\n\nprint(reverse_string("hello"))',
          expected: 'olleh',
          patterns: ['def reverse_string', 'for', 'return'],
          hints: ['Build a new string character by character', 'Iterate through the string from the last index to 0', 'You can use a while loop with a decreasing index'] },
        { id: 'py-03', title: 'Word Frequency Counter', lang: 'python', difficulty: 'intermediate', points: 20,
          description: 'Write a function that takes a sentence and returns a dictionary with word counts. Convert to lowercase, ignore punctuation.',
          starter: 'def word_count(sentence):\n    # Your code here\n    pass\n\nprint(word_count("The cat sat on the mat"))',
          expected: "{'the': 2, 'cat': 1, 'sat': 1, 'on': 1, 'mat': 1}",
          patterns: ['def word_count', 'split', 'lower', 'dict\\b|\\{\\}'],
          hints: ['Use .lower() to normalize case', 'Use .split() to break into words', 'Use a dictionary to track counts'] },
        { id: 'py-04', title: 'Caesar Cipher', lang: 'python', difficulty: 'intermediate', points: 20,
          description: 'Implement a Caesar cipher that shifts each letter by a given number. Preserve case, skip non-alpha characters.',
          starter: 'def caesar(text, shift):\n    # Your code here\n    pass\n\nprint(caesar("Hello World", 3))',
          expected: 'Khoor Zruog',
          patterns: ['def caesar', 'ord\\(', 'chr\\(', 'isalpha'],
          hints: ['Use ord() to get ASCII values and chr() to convert back', 'Handle wrap-around with modulo 26', 'Check .isalpha() before shifting'] },
        { id: 'py-05', title: 'Matrix Transpose', lang: 'python', difficulty: 'advanced', points: 30,
          description: 'Write a function that transposes an NxM matrix (list of lists). Rows become columns and columns become rows.',
          starter: 'def transpose(matrix):\n    # Your code here\n    pass\n\nm = [[1,2,3],[4,5,6]]\nprint(transpose(m))',
          expected: '[[1, 4], [2, 5], [3, 6]]',
          patterns: ['def transpose', 'for', 'range|len|zip', 'append|\\[\\]'],
          hints: ['The transposed matrix has len(matrix[0]) rows and len(matrix) columns', 'You can use nested loops or zip(*matrix)', 'Build each new row by collecting elements from the same column index'] },

        // ---- JavaScript (5) ----
        { id: 'js-01', title: 'Array Deduplication', lang: 'javascript', difficulty: 'beginner', points: 10,
          description: 'Write a function that removes duplicate values from an array without using Set.',
          starter: 'function deduplicate(arr) {\n    // Your code here\n}\n\nconsole.log(deduplicate([1,2,2,3,3,4]));',
          expected: '[1, 2, 3, 4]',
          patterns: ['function deduplicate', 'indexOf|includes|filter', 'push|return'],
          hints: ['Create a new empty array for unique values', 'Check if the value already exists before adding it', 'You can use indexOf() or includes() for the check'] },
        { id: 'js-02', title: 'Object Deep Clone', lang: 'javascript', difficulty: 'intermediate', points: 20,
          description: 'Write a function that deep clones an object, handling nested objects and arrays.',
          starter: 'function deepClone(obj) {\n    // Your code here\n}\n\nvar original = {a: 1, b: {c: 2}};\nvar copy = deepClone(original);',
          expected: '{"a":1,"b":{"c":2}}',
          patterns: ['function deepClone', 'typeof|Array\\.isArray', 'recursive|deepClone\\('],
          hints: ['Check if the value is an array with Array.isArray()', 'Check if the value is an object with typeof', 'Recursively clone nested objects and arrays'] },
        { id: 'js-03', title: 'Promise Chain', lang: 'javascript', difficulty: 'intermediate', points: 20,
          description: 'Write a function that fetches a user by ID (simulated), then fetches their posts. Chain two promises together.',
          starter: 'function getUser(id) {\n    return new Promise(function(resolve) {\n        setTimeout(function() { resolve({id: id, name: "User" + id}); }, 100);\n    });\n}\n\nfunction getPosts(userId) {\n    return new Promise(function(resolve) {\n        setTimeout(function() { resolve(["Post1", "Post2"]); }, 100);\n    });\n}\n\n// Chain getUser then getPosts\nfunction getUserPosts(id) {\n    // Your code here\n}',
          expected: '["Post1","Post2"]',
          patterns: ['function getUserPosts', '\\.then\\(', 'getUser|getPosts', 'return'],
          hints: ['Call getUser(id) first and return its promise', 'Use .then() to chain the second call', 'Return getPosts(user.id) inside the first .then()'] },
        { id: 'js-04', title: 'Event Debouncer', lang: 'javascript', difficulty: 'advanced', points: 30,
          description: 'Implement a debounce function that delays invoking the callback until after a specified wait time has elapsed since the last call.',
          starter: 'function debounce(fn, delay) {\n    // Your code here\n}\n\nvar log = debounce(function(msg) { console.log(msg); }, 300);',
          expected: 'debounced function',
          patterns: ['function debounce', 'setTimeout', 'clearTimeout', 'return function'],
          hints: ['Store the timeout ID in a closure variable', 'Clear the previous timeout on each new call', 'Return a new function that wraps the original'] },
        { id: 'js-05', title: 'Flatten Nested Array', lang: 'javascript', difficulty: 'beginner', points: 10,
          description: 'Write a function that flattens a deeply nested array without using Array.flat().',
          starter: 'function flatten(arr) {\n    // Your code here\n}\n\nconsole.log(flatten([1,[2,[3,[4]],5]]));',
          expected: '[1, 2, 3, 4, 5]',
          patterns: ['function flatten', 'Array\\.isArray|instanceof Array', 'concat|push|spread'],
          hints: ['Use recursion to handle arbitrary nesting depth', 'Check if each element is itself an array', 'Concatenate the results of recursive calls'] },

        // ---- C (5) ----
        { id: 'c-01', title: 'String Length', lang: 'c', difficulty: 'beginner', points: 10,
          description: 'Write a function that calculates the length of a string without using strlen(). Count characters until you hit the null terminator.',
          starter: '#include <stdio.h>\n\nint my_strlen(const char *s) {\n    // Your code here\n}\n\nint main() {\n    printf("%d\\n", my_strlen("hello"));\n    return 0;\n}',
          expected: '5',
          patterns: ['int my_strlen', 'while|for', '\\\\0|NULL', 'return'],
          hints: ['A C string ends with a null character (\\0)', 'Use a counter variable and iterate until you find \\0', 'Increment a pointer or index for each character'] },
        { id: 'c-02', title: 'Swap Without Temp', lang: 'c', difficulty: 'beginner', points: 10,
          description: 'Write a function that swaps two integers using pointers without a temporary variable.',
          starter: '#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    // Your code here\n}\n\nint main() {\n    int x = 5, y = 10;\n    swap(&x, &y);\n    printf("x=%d y=%d\\n", x, y);\n    return 0;\n}',
          expected: 'x=10 y=5',
          patterns: ['void swap', '\\*a|\\*b', '\\+|\\-|\\^'],
          hints: ['You can use XOR: *a ^= *b; *b ^= *a; *a ^= *b;', 'Or arithmetic: *a = *a + *b; *b = *a - *b; *a = *a - *b;', 'Both approaches work without a temporary variable'] },
        { id: 'c-03', title: 'Linked List Insert', lang: 'c', difficulty: 'intermediate', points: 20,
          description: 'Implement a function that inserts a node at the beginning of a singly linked list.',
          starter: '#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct Node {\n    int data;\n    struct Node *next;\n} Node;\n\nNode* insert_front(Node *head, int value) {\n    // Your code here\n}\n\nint main() {\n    Node *list = NULL;\n    list = insert_front(list, 3);\n    list = insert_front(list, 2);\n    list = insert_front(list, 1);\n    // prints: 1 -> 2 -> 3\n    return 0;\n}',
          expected: '1 -> 2 -> 3',
          patterns: ['Node\\*|struct Node', 'malloc', '->next', '->data', 'return'],
          hints: ['Allocate a new node with malloc(sizeof(Node))', 'Set the new node data and point its next to current head', 'Return the new node as the new head'] },
        { id: 'c-04', title: 'Buffer Overflow Guard', lang: 'c', difficulty: 'advanced', points: 30,
          description: 'Write a safe string copy function that prevents buffer overflow by respecting a maximum destination size.',
          starter: '#include <stdio.h>\n\nvoid safe_strcpy(char *dest, const char *src, int dest_size) {\n    // Your code here\n}\n\nint main() {\n    char buf[6];\n    safe_strcpy(buf, "Hello, World!", 6);\n    printf("%s\\n", buf);\n    return 0;\n}',
          expected: 'Hello',
          patterns: ['void safe_strcpy', 'dest_size|size', '\\\\0|null', 'while|for'],
          hints: ['Copy at most dest_size - 1 characters', 'Always null-terminate the destination', 'Check both source end and destination limit in your loop'] },
        { id: 'c-05', title: 'Bitwise Flag System', lang: 'c', difficulty: 'intermediate', points: 20,
          description: 'Implement set_flag, clear_flag, and check_flag functions using bitwise operations on an unsigned int.',
          starter: '#include <stdio.h>\n\n#define READ    (1 << 0)\n#define WRITE   (1 << 1)\n#define EXECUTE (1 << 2)\n\nunsigned int set_flag(unsigned int flags, unsigned int flag) {\n    // Your code here\n}\n\nunsigned int clear_flag(unsigned int flags, unsigned int flag) {\n    // Your code here\n}\n\nint check_flag(unsigned int flags, unsigned int flag) {\n    // Your code here\n}',
          expected: 'flags work correctly',
          patterns: ['\\|', '&', '~', '<<'],
          hints: ['Use OR (|) to set a flag', 'Use AND (&) with NOT (~) to clear a flag', 'Use AND (&) to check if a flag is set'] },

        // ---- Go (5) ----
        { id: 'go-01', title: 'Palindrome Check', lang: 'go', difficulty: 'beginner', points: 10,
          description: 'Write a function that checks if a string is a palindrome (reads the same forwards and backwards). Ignore case.',
          starter: 'package main\n\nimport (\n    "fmt"\n    "strings"\n)\n\nfunc isPalindrome(s string) bool {\n    // Your code here\n}\n\nfunc main() {\n    fmt.Println(isPalindrome("Racecar"))\n}',
          expected: 'true',
          patterns: ['func isPalindrome', 'strings\\.ToLower|strings\\.EqualFold', 'for|range', 'return true|return false'],
          hints: ['Convert to lowercase first with strings.ToLower()', 'Compare characters from front and back moving inward', 'Use two pointers: one starting at 0, one at len-1'] },
        { id: 'go-02', title: 'Goroutine Worker Pool', lang: 'go', difficulty: 'advanced', points: 30,
          description: 'Create a worker pool with 3 goroutines that process jobs from a channel and send results to a results channel.',
          starter: 'package main\n\nimport "fmt"\n\nfunc worker(id int, jobs <-chan int, results chan<- int) {\n    // Your code here\n}\n\nfunc main() {\n    jobs := make(chan int, 5)\n    results := make(chan int, 5)\n\n    // Start 3 workers\n    // Send 5 jobs\n    // Collect results\n}',
          expected: 'all jobs processed',
          patterns: ['func worker', 'go worker', 'chan', 'range', '<-'],
          hints: ['Use range to read from the jobs channel until it closes', 'Launch workers with go worker(id, jobs, results)', 'Close the jobs channel after sending all jobs'] },
        { id: 'go-03', title: 'Error Wrapping', lang: 'go', difficulty: 'intermediate', points: 20,
          description: 'Write a function that reads a config file path, validates it, and returns wrapped errors using fmt.Errorf with %w.',
          starter: 'package main\n\nimport (\n    "errors"\n    "fmt"\n)\n\nvar ErrInvalidPath = errors.New("invalid path")\n\nfunc loadConfig(path string) error {\n    // Your code here\n}\n\nfunc main() {\n    err := loadConfig("")\n    fmt.Println(errors.Is(err, ErrInvalidPath))\n}',
          expected: 'true',
          patterns: ['func loadConfig', 'fmt\\.Errorf', '%w', 'errors\\.Is|errors\\.As'],
          hints: ['Use fmt.Errorf("context: %w", err) to wrap errors', 'Return ErrInvalidPath for empty paths', 'errors.Is() can unwrap to find the original error'] },
        { id: 'go-04', title: 'Slice Operations', lang: 'go', difficulty: 'beginner', points: 10,
          description: 'Write functions to remove an element at index i from a slice and insert an element at index i.',
          starter: 'package main\n\nimport "fmt"\n\nfunc removeAt(s []int, i int) []int {\n    // Your code here\n}\n\nfunc insertAt(s []int, i int, val int) []int {\n    // Your code here\n}\n\nfunc main() {\n    s := []int{1, 2, 3, 4, 5}\n    fmt.Println(removeAt(s, 2))\n    fmt.Println(insertAt(s, 2, 99))\n}',
          expected: '[1 2 4 5]',
          patterns: ['func removeAt', 'func insertAt', 'append', '\\.\\.\\.|\\[:|:\\]'],
          hints: ['Use append(s[:i], s[i+1:]...) to remove', 'For insert: append to s[:i], add val, then s[i:]', 'Remember Go slice syntax: s[low:high]'] },
        { id: 'go-05', title: 'HTTP Middleware', lang: 'go', difficulty: 'intermediate', points: 20,
          description: 'Write a logging middleware that wraps an HTTP handler and prints the method, path, and response time.',
          starter: 'package main\n\nimport (\n    "fmt"\n    "net/http"\n    "time"\n)\n\nfunc loggingMiddleware(next http.HandlerFunc) http.HandlerFunc {\n    // Your code here\n}\n\nfunc hello(w http.ResponseWriter, r *http.Request) {\n    fmt.Fprintf(w, "Hello!")\n}',
          expected: 'GET /path 200 15ms',
          patterns: ['func loggingMiddleware', 'return func|http\\.HandlerFunc', 'time\\.Now|time\\.Since', 'r\\.Method|r\\.URL'],
          hints: ['Return a new HandlerFunc that wraps the original', 'Record time.Now() before calling next()', 'Log method, URL path, and elapsed time after the handler runs'] },

        // ---- Rust (5) ----
        { id: 'rs-01', title: 'Ownership Transfer', lang: 'rust', difficulty: 'beginner', points: 10,
          description: 'Fix the code so it compiles. Demonstrate understanding of Rust ownership by using clone or references.',
          starter: 'fn main() {\n    let s1 = String::from("hello");\n    let s2 = s1;  // s1 is moved\n    // Fix: make this line work\n    println!("{} {}", s1, s2);\n}',
          expected: 'hello hello',
          patterns: ['clone\\(\\)|&s1|\\.to_string', 'println!', 'String::from'],
          hints: ['After let s2 = s1, s1 is no longer valid (moved)', 'Use .clone() to create a deep copy: let s2 = s1.clone()', 'Alternatively, use a reference: let s2 = &s1'] },
        { id: 'rs-02', title: 'Pattern Matching', lang: 'rust', difficulty: 'beginner', points: 10,
          description: 'Write a function using match to convert an HTTP status code to a description string.',
          starter: 'fn status_text(code: u16) -> &\'static str {\n    // Your code here using match\n}\n\nfn main() {\n    println!("{}", status_text(200));\n    println!("{}", status_text(404));\n}',
          expected: 'OK\nNot Found',
          patterns: ['fn status_text', 'match', '=>', '200|404|500', '_'],
          hints: ['Use match code { 200 => "OK", ... }', 'Include a catch-all arm with _ => "Unknown"', 'Common codes: 200 OK, 201 Created, 301 Moved, 400 Bad Request, 404 Not Found, 500 Internal Server Error'] },
        { id: 'rs-03', title: 'Iterator Chain', lang: 'rust', difficulty: 'intermediate', points: 20,
          description: 'Use iterator methods to filter even numbers, double them, and collect into a Vec.',
          starter: 'fn transform(nums: Vec<i32>) -> Vec<i32> {\n    // Your code here using .iter().filter().map().collect()\n}\n\nfn main() {\n    let result = transform(vec![1,2,3,4,5,6]);\n    println!("{:?}", result); // [4, 8, 12]\n}',
          expected: '[4, 8, 12]',
          patterns: ['fn transform', '\\.iter\\(\\)|\\.into_iter\\(\\)', '\\.filter\\(', '\\.map\\(', '\\.collect\\('],
          hints: ['Chain .iter().filter().map().collect()', 'Filter with |x| x % 2 == 0', 'Map with |x| x * 2'] },
        { id: 'rs-04', title: 'Error Handling with Result', lang: 'rust', difficulty: 'intermediate', points: 20,
          description: 'Write a function that parses a string to an integer and returns a Result with a custom error message.',
          starter: 'fn parse_port(s: &str) -> Result<u16, String> {\n    // Your code here\n}\n\nfn main() {\n    match parse_port("8080") {\n        Ok(port) => println!("Port: {}", port),\n        Err(e) => println!("Error: {}", e),\n    }\n}',
          expected: 'Port: 8080',
          patterns: ['fn parse_port', 'Result', 'Ok\\(', 'Err\\(', 'parse|map_err'],
          hints: ['Use s.parse::<u16>() to attempt conversion', 'Use .map_err(|e| format!("...")) to convert the error', 'Return Ok(value) on success, Err(message) on failure'] },
        { id: 'rs-05', title: 'Trait Implementation', lang: 'rust', difficulty: 'advanced', points: 30,
          description: 'Define a trait Summarizable with a method summary() and implement it for a NewsArticle struct and a Tweet struct.',
          starter: '// Define the trait and structs\n// Implement Summarizable for both\n\nfn main() {\n    let article = NewsArticle {\n        title: String::from("Breaking News"),\n        author: String::from("Reporter"),\n        content: String::from("Something happened."),\n    };\n    println!("{}", article.summary());\n}',
          expected: 'Breaking News by Reporter',
          patterns: ['trait Summarizable', 'impl Summarizable', 'fn summary', 'struct NewsArticle', 'struct Tweet'],
          hints: ['Define trait Summarizable { fn summary(&self) -> String; }', 'Use impl Summarizable for NewsArticle { ... }', 'Each struct can have a different summary format'] },

        // ---- Java (5) ----
        { id: 'java-01', title: 'ArrayList vs LinkedList', lang: 'java', difficulty: 'beginner', points: 10,
          description: 'Create both an ArrayList and LinkedList, add elements, and demonstrate when each is more efficient.',
          starter: 'import java.util.*;\n\npublic class ListDemo {\n    public static void main(String[] args) {\n        // Create ArrayList and LinkedList\n        // Add elements to both\n        // Print both lists\n    }\n}',
          expected: '[1, 2, 3]',
          patterns: ['ArrayList', 'LinkedList', '\\.add\\(', 'new.*List'],
          hints: ['ArrayList is fast for random access (get by index)', 'LinkedList is fast for insertions/deletions at the beginning', 'Both implement the List interface'] },
        { id: 'java-02', title: 'Exception Hierarchy', lang: 'java', difficulty: 'intermediate', points: 20,
          description: 'Create a custom exception class InsufficientFundsException that extends Exception. Write a BankAccount class that throws it.',
          starter: 'public class BankAccount {\n    private double balance;\n\n    public BankAccount(double initial) {\n        this.balance = initial;\n    }\n\n    public void withdraw(double amount) /* throws ??? */ {\n        // Your code here\n    }\n}',
          expected: 'InsufficientFundsException thrown',
          patterns: ['class InsufficientFundsException', 'extends Exception', 'throws', 'throw new', 'try.*catch'],
          hints: ['Define: class InsufficientFundsException extends Exception', 'Add a constructor that passes a message to super()', 'Throw it when amount > balance'] },
        { id: 'java-03', title: 'Interface Implementation', lang: 'java', difficulty: 'beginner', points: 10,
          description: 'Define a Sortable interface with a sort() method. Implement it in a NumberList class that sorts an internal array.',
          starter: 'public interface Sortable {\n    // Define sort method\n}\n\npublic class NumberList implements Sortable {\n    private int[] numbers;\n\n    public NumberList(int[] nums) {\n        this.numbers = nums;\n    }\n\n    // Implement sort\n}',
          expected: '[1, 2, 3, 4, 5]',
          patterns: ['interface Sortable', 'implements Sortable', 'void sort', 'Arrays\\.sort|for'],
          hints: ['Define void sort() in the interface', 'Implement sort() in NumberList using any sorting algorithm', 'You can use Arrays.sort() or write your own bubble sort'] },
        { id: 'java-04', title: 'Stream Pipeline', lang: 'java', difficulty: 'intermediate', points: 20,
          description: 'Use Java Streams to filter a list of employees by salary > 50000, map to names, sort alphabetically, and collect.',
          starter: 'import java.util.*;\nimport java.util.stream.*;\n\npublic class StreamDemo {\n    public static void main(String[] args) {\n        List<String[]> employees = Arrays.asList(\n            new String[]{"Alice", "60000"},\n            new String[]{"Bob", "45000"},\n            new String[]{"Charlie", "75000"}\n        );\n        // Use streams to filter, map, sort, collect\n    }\n}',
          expected: '[Alice, Charlie]',
          patterns: ['\\.stream\\(\\)', '\\.filter\\(', '\\.map\\(', '\\.sorted\\(', '\\.collect\\('],
          hints: ['Start with employees.stream()', 'Filter where Integer.parseInt(e[1]) > 50000', 'Map to e[0] to get just the name'] },
        { id: 'java-05', title: 'Thread-Safe Counter', lang: 'java', difficulty: 'advanced', points: 30,
          description: 'Implement a thread-safe counter using synchronized or AtomicInteger. Launch 10 threads that each increment 1000 times.',
          starter: 'import java.util.concurrent.atomic.AtomicInteger;\n\npublic class SafeCounter {\n    // Your counter variable\n\n    public void increment() {\n        // Thread-safe increment\n    }\n\n    public int get() {\n        // Return current value\n    }\n}',
          expected: '10000',
          patterns: ['AtomicInteger|synchronized', 'increment|addAndGet|getAndIncrement', 'Thread|Runnable', '\\.start\\(|\\.join\\('],
          hints: ['AtomicInteger provides lock-free thread safety', 'Use .incrementAndGet() or .getAndIncrement()', 'Join all threads before reading the final value'] },

        // ---- C# (5) ----
        { id: 'cs-01', title: 'LINQ Query', lang: 'csharp', difficulty: 'beginner', points: 10,
          description: 'Use LINQ to filter a list of numbers for values greater than 5, order descending, and select their squares.',
          starter: 'using System;\nusing System.Linq;\nusing System.Collections.Generic;\n\nclass Program {\n    static void Main() {\n        var numbers = new List<int> {3, 7, 1, 9, 4, 8, 2, 6};\n        // Use LINQ here\n    }\n}',
          expected: '[81, 64, 49, 36]',
          patterns: ['\\.Where\\(|\\.where\\(|from.*where', '\\.OrderByDescending\\(|orderby.*descending', '\\.Select\\(|select', 'LINQ|System\\.Linq'],
          hints: ['Use .Where(x => x > 5) to filter', 'Chain .OrderByDescending(x => x) to sort', 'Use .Select(x => x * x) to transform'] },
        { id: 'cs-02', title: 'Async/Await Pattern', lang: 'csharp', difficulty: 'intermediate', points: 20,
          description: 'Write an async method that simulates downloading files. Use Task.Delay to simulate network time. Process 3 downloads concurrently.',
          starter: 'using System;\nusing System.Threading.Tasks;\n\nclass Downloader {\n    static async Task<string> DownloadFile(string name, int ms) {\n        // Simulate download\n    }\n\n    static async Task Main() {\n        // Download 3 files concurrently\n    }\n}',
          expected: 'All downloads complete',
          patterns: ['async Task', 'await', 'Task\\.Delay', 'Task\\.WhenAll|Task\\.WaitAll'],
          hints: ['Use await Task.Delay(ms) to simulate the download time', 'Start all three tasks before awaiting any', 'Use Task.WhenAll() to wait for all concurrent tasks'] },
        { id: 'cs-03', title: 'Delegate & Event', lang: 'csharp', difficulty: 'intermediate', points: 20,
          description: 'Create a TemperatureSensor class that raises an event when temperature exceeds a threshold.',
          starter: 'using System;\n\nclass TemperatureSensor {\n    // Define delegate, event, threshold\n    // Method to set temperature\n}\n\nclass Program {\n    static void Main() {\n        var sensor = new TemperatureSensor(100);\n        // Subscribe to event\n        sensor.SetTemperature(105);\n    }\n}',
          expected: 'ALERT: Temperature 105 exceeds threshold',
          patterns: ['delegate|event|EventHandler', 'event.*Handler', '\\+=', 'Invoke|\\?\\.',  'class TemperatureSensor'],
          hints: ['Define a delegate type or use EventHandler', 'Declare an event with the event keyword', 'Raise the event with ?.Invoke() when threshold is exceeded'] },
        { id: 'cs-04', title: 'Generic Repository', lang: 'csharp', difficulty: 'advanced', points: 30,
          description: 'Implement a generic Repository<T> class with Add, GetById, GetAll, and Remove methods using a Dictionary.',
          starter: 'using System;\nusing System.Collections.Generic;\n\ninterface IEntity {\n    int Id { get; set; }\n}\n\nclass Repository<T> where T : IEntity {\n    // Your implementation\n}',
          expected: 'CRUD operations work',
          patterns: ['class Repository<T>', 'where T', 'Dictionary|List', 'Add|GetById|GetAll|Remove'],
          hints: ['Use Dictionary<int, T> for O(1) lookup by Id', 'The where T : IEntity constraint ensures T has an Id property', 'GetAll can return the Values of the dictionary'] },
        { id: 'cs-05', title: 'Extension Method', lang: 'csharp', difficulty: 'beginner', points: 10,
          description: 'Write extension methods for the string class: WordCount(), Truncate(maxLength), and IsValidEmail().',
          starter: 'using System;\n\nstatic class StringExtensions {\n    // Your extension methods here\n}\n\nclass Program {\n    static void Main() {\n        string text = "Hello beautiful world";\n        Console.WriteLine(text.WordCount());\n        Console.WriteLine(text.Truncate(10));\n    }\n}',
          expected: '3\nHello beau...',
          patterns: ['static class.*Extensions', 'this string', 'public static', 'WordCount|Truncate|IsValidEmail'],
          hints: ['Extension methods must be static in a static class', 'The first parameter uses the this keyword: this string s', 'Split by spaces for WordCount, Substring for Truncate'] },

        // ---- Bash (5) ----
        { id: 'bash-01', title: 'File Backup Script', lang: 'bash', difficulty: 'beginner', points: 10,
          description: 'Write a script that backs up a directory by creating a timestamped tar.gz archive.',
          starter: '#!/bin/bash\n# Backup script\nSOURCE_DIR=$1\n\n# Create timestamp\n# Create tar.gz archive\n# Print success message',
          expected: 'backup-2026-03-16.tar.gz created',
          patterns: ['\\$1|\\$\\{1\\}', 'date|\\+%Y', 'tar.*czf|tar.*-czf', 'echo'],
          hints: ['Use $(date +%Y-%m-%d) for the timestamp', 'Use tar -czf archive.tar.gz directory/', 'Check if SOURCE_DIR is provided with -z test'] },
        { id: 'bash-02', title: 'Log Analyzer', lang: 'bash', difficulty: 'intermediate', points: 20,
          description: 'Write a script that parses an Apache/Nginx log file and reports: total requests, unique IPs, top 5 requested URLs.',
          starter: '#!/bin/bash\n# Log Analyzer\nLOG_FILE=$1\n\n# Total requests\n# Unique IPs\n# Top 5 URLs',
          expected: 'Total: 1000, Unique IPs: 42, Top URLs listed',
          patterns: ['wc -l|wc.*-l', 'awk|cut', 'sort.*uniq|sort.*-u', 'head.*-n.*5|head.*-5'],
          hints: ['Use wc -l for total request count', 'Use awk to extract IP field and sort -u to count unique', 'Pipe through sort | uniq -c | sort -rn | head -5 for top URLs'] },
        { id: 'bash-03', title: 'Service Monitor', lang: 'bash', difficulty: 'intermediate', points: 20,
          description: 'Write a script that checks if a list of services are running. If any are down, log an alert and optionally restart.',
          starter: '#!/bin/bash\n# Service Monitor\nSERVICES=("nginx" "sshd" "postgresql")\n\nfor service in "${SERVICES[@]}"; do\n    # Check if running\n    # Log status\n    # Restart if down\ndone',
          expected: 'nginx: RUNNING, sshd: RUNNING',
          patterns: ['systemctl|service|pgrep|pidof', 'for.*in.*\\$\\{', 'if.*then', 'echo|logger|>>'],
          hints: ['Use systemctl is-active or pgrep to check service status', 'Use $? to check the exit code of the last command', 'Use systemctl restart to restart a failed service'] },
        { id: 'bash-04', title: 'User Account Audit', lang: 'bash', difficulty: 'advanced', points: 30,
          description: 'Write a script that audits user accounts: find users with no password, expired passwords, users in sudo group, and accounts with login shells.',
          starter: '#!/bin/bash\n# User Account Audit\n\n# Check /etc/passwd for login shells\n# Check /etc/shadow for password status\n# Check sudo/wheel group membership\n# Generate report',
          expected: 'Audit complete: X users, Y with sudo, Z with expired passwords',
          patterns: ['/etc/passwd|/etc/shadow', 'awk.*-F.*:', 'grep.*sudo|grep.*wheel', 'chage|passwd.*-S'],
          hints: ['Parse /etc/passwd with awk -F: to extract fields', 'Field 7 of /etc/passwd is the login shell', 'Use getent group sudo to list sudo members'] },
        { id: 'bash-05', title: 'Network Scanner', lang: 'bash', difficulty: 'beginner', points: 10,
          description: 'Write a script that pings a range of IPs on a subnet and reports which hosts are alive.',
          starter: '#!/bin/bash\n# Simple Network Scanner\nSUBNET=${1:-"192.168.1"}\n\n# Ping sweep\n# Report alive hosts',
          expected: '192.168.1.1 is alive',
          patterns: ['ping.*-c.*1|ping.*-W', 'for.*in.*seq|for.*\\{1\\.\\.254\\}', 'if.*\\$\\?', 'echo|printf'],
          hints: ['Use ping -c 1 -W 1 for a single quick ping', 'Loop through 1 to 254 for a /24 subnet', 'Check $? -eq 0 to see if the host responded'] },

        // ---- SQL (5) ----
        { id: 'sql-01', title: 'Employee Report', lang: 'sql', difficulty: 'beginner', points: 10,
          description: 'Write a query to find all employees in the Sales department who earn more than $50,000, ordered by salary descending.',
          starter: '-- Table: employees (id, name, department, salary, hire_date)\n\nSELECT\n    -- your columns\nFROM employees\n-- your conditions\n-- your ordering',
          expected: 'SELECT name, salary FROM employees WHERE department = \'Sales\' AND salary > 50000 ORDER BY salary DESC',
          patterns: ['SELECT', 'FROM\\s+employees', 'WHERE.*department.*Sales', 'salary\\s*>\\s*50000', 'ORDER BY.*salary.*DESC'],
          hints: ['Use WHERE to filter by department and salary', 'AND combines multiple conditions', 'ORDER BY salary DESC sorts highest first'] },
        { id: 'sql-02', title: 'JOIN Query', lang: 'sql', difficulty: 'beginner', points: 10,
          description: 'Write a query joining orders and customers tables to show customer name, order date, and total for orders over $100.',
          starter: '-- Tables: customers (id, name, email)\n--         orders (id, customer_id, order_date, total)\n\nSELECT\n    -- your columns\nFROM orders\n-- your join\n-- your conditions',
          expected: 'SELECT c.name, o.order_date, o.total FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.total > 100',
          patterns: ['SELECT', 'JOIN|INNER JOIN', 'ON.*customer_id.*=.*c\\.id|ON.*id.*=.*customer_id', 'WHERE.*total.*>.*100'],
          hints: ['Use JOIN (or INNER JOIN) to connect tables', 'The ON clause specifies how tables relate: orders.customer_id = customers.id', 'Use table aliases (o, c) for cleaner code'] },
        { id: 'sql-03', title: 'Subquery Analysis', lang: 'sql', difficulty: 'intermediate', points: 20,
          description: 'Find employees who earn more than the average salary in their department. Use a correlated subquery.',
          starter: '-- Table: employees (id, name, department, salary)\n\nSELECT name, department, salary\nFROM employees e\nWHERE salary > (\n    -- your subquery\n)',
          expected: 'correlated subquery comparing department averages',
          patterns: ['SELECT.*FROM.*employees', 'WHERE.*salary.*>', 'SELECT.*AVG\\(salary\\)', 'WHERE.*department.*=.*e\\.department'],
          hints: ['The subquery must reference the outer table (correlated)', 'AVG(salary) calculates the average', 'Match departments: WHERE department = e.department'] },
        { id: 'sql-04', title: 'Window Functions', lang: 'sql', difficulty: 'advanced', points: 30,
          description: 'Use window functions to rank employees by salary within each department, and show running total of salaries.',
          starter: '-- Table: employees (id, name, department, salary)\n\nSELECT\n    name, department, salary,\n    -- rank within department\n    -- running total within department\nFROM employees',
          expected: 'RANK() OVER (PARTITION BY department ORDER BY salary DESC)',
          patterns: ['RANK\\(\\)|ROW_NUMBER\\(\\)|DENSE_RANK\\(\\)', 'OVER\\s*\\(', 'PARTITION BY', 'ORDER BY.*salary', 'SUM\\(salary\\).*OVER'],
          hints: ['RANK() OVER (PARTITION BY dept ORDER BY salary DESC) ranks within groups', 'SUM(salary) OVER (PARTITION BY dept ORDER BY salary) gives running total', 'PARTITION BY creates separate windows per department'] },
        { id: 'sql-05', title: 'Security Audit Query', lang: 'sql', difficulty: 'intermediate', points: 20,
          description: 'Write queries to detect: failed login attempts > 5 in last hour, accounts with no recent activity, and privilege escalation events.',
          starter: '-- Tables: login_attempts (user_id, timestamp, success)\n--         user_sessions (user_id, last_active)\n--         permission_changes (user_id, old_role, new_role, changed_at)\n\n-- Query 1: Brute force detection\n-- Query 2: Inactive accounts\n-- Query 3: Privilege escalation',
          expected: 'Three security queries',
          patterns: ['COUNT\\(\\*\\).*>\\s*5|HAVING.*COUNT', 'GROUP BY.*user_id', 'WHERE.*success.*=.*false|WHERE.*success.*=.*0', 'NOW\\(\\)|CURRENT_TIMESTAMP|INTERVAL'],
          hints: ['GROUP BY user_id and HAVING COUNT(*) > 5 for brute force', 'Use date functions: WHERE timestamp > NOW() - INTERVAL 1 HOUR', 'Check old_role vs new_role for privilege escalation'] },

        // ---- PowerShell (5) ----
        { id: 'ps-01', title: 'System Info Gatherer', lang: 'powershell', difficulty: 'beginner', points: 10,
          description: 'Write a script that collects OS version, hostname, CPU info, RAM, and disk space, then outputs a formatted report.',
          starter: '# System Information Gatherer\n\n$hostname = # Get hostname\n$os = # Get OS info\n$cpu = # Get CPU info\n$ram = # Get RAM info\n$disk = # Get disk info\n\n# Format and display report',
          expected: 'System Report generated',
          patterns: ['Get-ComputerInfo|\\$env:COMPUTERNAME|hostname', 'Get-CimInstance|Get-WmiObject', 'Win32_Processor|Win32_OperatingSystem', 'Write-Host|Write-Output|Format-Table'],
          hints: ['Use $env:COMPUTERNAME or hostname for the computer name', 'Get-CimInstance Win32_OperatingSystem for OS info', 'Get-CimInstance Win32_LogicalDisk for disk space'] },
        { id: 'ps-02', title: 'AD User Report', lang: 'powershell', difficulty: 'intermediate', points: 20,
          description: 'Write a script that queries Active Directory for disabled accounts, accounts with expired passwords, and accounts not logged in for 90 days.',
          starter: '# AD User Audit Report\n\n# Disabled accounts\n# Expired passwords\n# Inactive accounts (90+ days)\n# Export to CSV',
          expected: 'AD audit report exported',
          patterns: ['Get-ADUser|Search-ADAccount', 'Enabled.*-eq.*\\$false|AccountDisabled', 'PasswordExpired|PasswordLastSet', 'LastLogonDate|lastLogon', 'Export-Csv|ConvertTo-Csv'],
          hints: ['Search-ADAccount -AccountDisabled finds disabled accounts', 'Search-ADAccount -PasswordExpired finds expired passwords', 'Compare LastLogonDate to (Get-Date).AddDays(-90)'] },
        { id: 'ps-03', title: 'Registry Scanner', lang: 'powershell', difficulty: 'intermediate', points: 20,
          description: 'Write a script that scans common registry run keys for persistence mechanisms -- a basic malware detection technique.',
          starter: '# Registry Persistence Scanner\n$runKeys = @(\n    "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run",\n    "HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run"\n)\n\n# Scan each key\n# Report suspicious entries',
          expected: 'Registry scan complete: X entries found',
          patterns: ['HKLM:|HKCU:', 'Get-ItemProperty|Get-Item', 'CurrentVersion\\\\Run', 'foreach|ForEach-Object|\\|.*%'],
          hints: ['Use Get-ItemProperty to read registry values', 'Check HKLM and HKCU Run keys', 'Flag entries pointing to temp directories or encoded commands'] },
        { id: 'ps-04', title: 'Log Parser Pipeline', lang: 'powershell', difficulty: 'advanced', points: 30,
          description: 'Build a pipeline that reads Windows Event Logs, filters for security events (4625 failed logins), groups by source IP, and exports results.',
          starter: '# Security Event Log Pipeline\n\n# Get failed login events (4625)\n# Group by source IP\n# Sort by count descending\n# Export report',
          expected: 'Security report: X failed logins from Y unique IPs',
          patterns: ['Get-WinEvent|Get-EventLog', '4625|FailedLogin', 'Group-Object|group', 'Sort-Object|sort', 'Where-Object|where|\\?'],
          hints: ['Get-WinEvent -FilterHashtable @{LogName="Security"; Id=4625}', 'Group-Object groups events by a property', 'Sort-Object -Property Count -Descending for top offenders'] },
        { id: 'ps-05', title: 'REST API Client', lang: 'powershell', difficulty: 'beginner', points: 10,
          description: 'Write functions to GET, POST, and DELETE resources from a REST API using Invoke-RestMethod.',
          starter: '# REST API Client\n$baseUrl = "https://api.example.com"\n\nfunction Get-Resource {\n    param([string]$Endpoint)\n    # Your code\n}\n\nfunction New-Resource {\n    param([string]$Endpoint, [hashtable]$Body)\n    # Your code\n}\n\nfunction Remove-Resource {\n    param([string]$Endpoint)\n    # Your code\n}',
          expected: 'API client functions defined',
          patterns: ['Invoke-RestMethod|Invoke-WebRequest', '-Method.*GET|Get', '-Method.*POST|Post', '-Method.*DELETE|Delete', '-Uri|-Body|-ContentType'],
          hints: ['Use Invoke-RestMethod -Uri $url -Method GET', 'For POST, add -Body (ConvertTo-Json $Body) -ContentType "application/json"', 'Invoke-RestMethod automatically parses JSON responses'] }
    ];

    function getProgress() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        } catch(e) { return {}; }
    }

    function saveProgress(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    return {
        challenges: CHALLENGES,

        getChallenge: function(id) {
            for (var i = 0; i < CHALLENGES.length; i++) {
                if (CHALLENGES[i].id === id) return CHALLENGES[i];
            }
            return null;
        },

        checkSolution: function(id, code) {
            var challenge = this.getChallenge(id);
            if (!challenge) return { pass: false, message: 'Challenge not found.' };
            if (!code || code.trim().length < 10) return { pass: false, message: 'Solution is too short. Write more code.' };

            var missing = [];
            for (var i = 0; i < challenge.patterns.length; i++) {
                var re = new RegExp(challenge.patterns[i], 'i');
                if (!re.test(code)) {
                    missing.push(challenge.patterns[i]);
                }
            }

            var matchRatio = (challenge.patterns.length - missing.length) / challenge.patterns.length;

            if (matchRatio >= 0.8) {
                var progress = getProgress();
                progress[id] = { completed: true, completedAt: new Date().toISOString(), points: challenge.points };
                saveProgress(progress);
                return { pass: true, message: 'Solution accepted! +' + challenge.points + ' points', score: matchRatio };
            } else if (matchRatio >= 0.5) {
                return { pass: false, message: 'Partial match (' + Math.round(matchRatio * 100) + '%). Check your approach -- some key elements are missing.', score: matchRatio };
            } else {
                return { pass: false, message: 'Solution does not match expected structure. Review the hints and try again.', score: matchRatio };
            }
        },

        getChallengesByLanguage: function(lang) {
            var result = [];
            for (var i = 0; i < CHALLENGES.length; i++) {
                if (CHALLENGES[i].lang === lang) result.push(CHALLENGES[i]);
            }
            return result;
        },

        getChallengesByDifficulty: function(level) {
            var result = [];
            for (var i = 0; i < CHALLENGES.length; i++) {
                if (CHALLENGES[i].difficulty === level) result.push(CHALLENGES[i]);
            }
            return result;
        },

        getUserProgress: function() {
            var progress = getProgress();
            var completed = 0;
            var totalPoints = 0;
            var byLang = {};
            for (var i = 0; i < CHALLENGES.length; i++) {
                var c = CHALLENGES[i];
                if (!byLang[c.lang]) byLang[c.lang] = { total: 0, completed: 0 };
                byLang[c.lang].total++;
                if (progress[c.id] && progress[c.id].completed) {
                    completed++;
                    totalPoints += progress[c.id].points || 0;
                    byLang[c.lang].completed++;
                }
            }
            return { completed: completed, total: CHALLENGES.length, points: totalPoints, byLanguage: byLang };
        },

        isCompleted: function(id) {
            var progress = getProgress();
            return progress[id] && progress[id].completed === true;
        }
    };
})();
