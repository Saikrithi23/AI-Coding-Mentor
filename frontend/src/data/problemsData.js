/**
 * Default local problem catalog for instant client-side loading and offline availability.
 * Synchronizes with backend catalog when backend is online.
 */

export const PROBLEMS_DATA = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Arrays & Hashing",
    companies: ["Amazon", "TCS Digital", "Accenture", "Microsoft", "Wipro Turbo"],
    description: "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. Return the indices separated by a space.",
    examples: [
      {
        input: "4\n2 7 11 15\n9",
        output: "0 1",
        explanation: "Because nums[0] + nums[1] == 2 + 7 == 9, we return 0 1."
      },
      {
        input: "3\n3 2 4\n6",
        output: "1 2",
        explanation: "Because nums[1] + nums[2] == 2 + 4 == 6, we return 1 2."
      },
      {
        input: "2\n3 3\n6",
        output: "0 1",
        explanation: "nums[0] + nums[1] == 6, so return 0 1."
      }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(n)",
    interview_tips: [
      "Always mention the brute force approach (O(n^2) nested loops) first, then propose the hash map optimization.",
      "Clarify if the array is sorted (if sorted, Two Pointers is O(1) space).",
      "Discuss duplicate values handling in the hash map."
    ],
    starter_code: {
      "C++": `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target;
    cin >> target;

    // TODO: Find two indices whose values add up to target
    unordered_map<int, int> seen;
    for (int i = 0; i < n; i++) {
        int complement = target - nums[i];
        if (seen.find(complement) != seen.end()) {
            cout << seen[complement] << " " << i << endl;
            return 0;
        }
        seen[nums[i]] = i;
    }

    return 0;
}
`,
      "Python": `def two_sum():
    import sys
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    target = int(input_data[n+1])

    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            print(f"{seen[complement]} {i}")
            return
        seen[num] = i

if __name__ == "__main__":
    two_sum()
`,
      "Java": `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();

        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < n; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                System.out.println(map.get(complement) + " " + i);
                return;
            }
            map.put(nums[i], i);
        }
    }
}
`,
      "C": `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int nums[n];
    for (int i = 0; i < n; i++) {
        scanf("%d", &nums[i]);
    }
    int target;
    scanf("%d", &target);

    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] == target) {
                printf("%d %d\\n", i, j);
                return 0;
            }
        }
    }
    return 0;
}
`
    },
    test_cases: [
      {
        id: 1,
        stdin: "4\n2 7 11 15\n9",
        expected_output: "0 1",
        is_sample: true
      },
      {
        id: 2,
        stdin: "3\n3 2 4\n6",
        expected_output: "1 2",
        is_sample: true
      },
      {
        id: 3,
        stdin: "2\n3 3\n6",
        expected_output: "0 1",
        is_sample: false
      },
      {
        id: 4,
        stdin: "5\n1 5 3 7 9\n12",
        expected_output: "1 3",
        is_sample: false
      }
    ]
  },
  {
    id: "valid-palindrome",
    title: "Valid Palindrome",
    difficulty: "Easy",
    topic: "Strings & Two Pointers",
    companies: ["Amazon", "Cognizant", "Infosys", "Cisco"],
    description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string, print `true` if it is a palindrome, or `false` otherwise.",
    examples: [
      {
        input: "A man, a plan, a canal: Panama",
        output: "true",
        explanation: "\"amanaplanacanalpanama\" is a palindrome."
      },
      {
        input: "race a car",
        output: "false",
        explanation: "\"raceacar\" is not a palindrome."
      }
    ],
    constraints: [
      "1 <= s.length <= 2 * 10^5",
      "s consists only of printable ASCII characters."
    ],
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(1)",
    interview_tips: [
      "Explain in-place two-pointer technique to avoid allocating extra memory.",
      "Mention character helper functions like isalnum() and tolower()."
    ],
    starter_code: {
      "C++": `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

int main() {
    string s;
    getline(cin, s);

    int left = 0, right = s.length() - 1;
    bool isPalindrome = true;
    while (left < right) {
        while (left < right && !isalnum(s[left])) left++;
        while (left < right && !isalnum(s[right])) right--;
        if (tolower(s[left]) != tolower(s[right])) {
            isPalindrome = false;
            break;
        }
        left++;
        right--;
    }

    cout << (isPalindrome ? "true" : "false") << endl;
    return 0;
}
`,
      "Python": `import sys

def is_palindrome():
    s = sys.stdin.read().strip()
    left, right = 0, len(s) - 1
    
    while left < right:
        while left < right and not s[left].isalnum():
            left += 1
        while left < right and not s[right].isalnum():
            right -= 1
        if s[left].lower() != s[right].lower():
            print("false")
            return
        left += 1
        right -= 1
        
    print("true")

if __name__ == "__main__":
    is_palindrome()
`,
      "Java": `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";

        int left = 0, right = s.length() - 1;
        boolean ok = true;
        while (left < right) {
            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                ok = false;
                break;
            }
            left++;
            right--;
        }
        System.out.println(ok ? "true" : "false");
    }
}
`,
      "C": `#include <stdio.h>
#include <string.h>
#include <ctype.h>

int main() {
    char s[10005];
    if (!fgets(s, sizeof(s), stdin)) return 0;
    int len = strlen(s);
    if (len > 0 && s[len-1] == '\\n') s[--len] = '\\0';

    int left = 0, right = len - 1;
    int ok = 1;
    while (left < right) {
        while (left < right && !isalnum((unsigned char)s[left])) left++;
        while (left < right && !isalnum((unsigned char)s[right])) right--;
        if (tolower((unsigned char)s[left]) != tolower((unsigned char)s[right])) {
            ok = 0;
            break;
        }
        left++;
        right--;
    }
    printf("%s\\n", ok ? "true" : "false");
    return 0;
}
`
    },
    test_cases: [
      {
        id: 1,
        stdin: "A man, a plan, a canal: Panama",
        expected_output: "true",
        is_sample: true
      },
      {
        id: 2,
        stdin: "race a car",
        expected_output: "false",
        is_sample: true
      },
      {
        id: 3,
        stdin: " ",
        expected_output: "true",
        is_sample: false
      },
      {
        id: 4,
        stdin: "0P",
        expected_output: "false",
        is_sample: false
      }
    ]
  },
  {
    id: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    topic: "Searching & Algorithms",
    companies: ["Amazon", "Google", "TCS", "Capgemini", "Oracle"],
    description: "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, return its index. Otherwise, return `-1`.\n\nYou must write an algorithm with `O(log n)` runtime complexity.",
    examples: [
      {
        input: "6\n-1 0 3 5 9 12\n9",
        output: "4",
        explanation: "9 exists in nums and its index is 4."
      },
      {
        input: "6\n-1 0 3 5 9 12\n2",
        output: "-1",
        explanation: "2 does not exist in nums so return -1."
      }
    ],
    constraints: [
      "1 <= nums.length <= 10^4",
      "-10^4 < nums[i], target < 10^4",
      "All the integers in nums are unique.",
      "nums is sorted in ascending order."
    ],
    expected_time_complexity: "O(log n)",
    expected_space_complexity: "O(1)",
    interview_tips: [
      "Be careful about integer overflow: use mid = left + (right - left) / 2.",
      "Explain why binary search reduces search space by half each iteration."
    ],
    starter_code: {
      "C++": `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target;
    cin >> target;

    int left = 0, right = n - 1;
    int ans = -1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) {
            ans = mid;
            break;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    cout << ans << endl;
    return 0;
}
`,
      "Python": `import sys

def binary_search():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    target = int(input_data[n+1])

    left, right = 0, n - 1
    ans = -1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            ans = mid
            break
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    print(ans)

if __name__ == "__main__":
    binary_search()
`,
      "Java": `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();

        int left = 0, right = n - 1;
        int ans = -1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) {
                ans = mid;
                break;
            } else if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        System.out.println(ans);
    }
}
`,
      "C": `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int nums[n];
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);
    int target;
    scanf("%d", &target);

    int left = 0, right = n - 1;
    int ans = -1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) {
            ans = mid;
            break;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    printf("%d\\n", ans);
    return 0;
}
`
    },
    test_cases: [
      {
        id: 1,
        stdin: "6\n-1 0 3 5 9 12\n9",
        expected_output: "4",
        is_sample: true
      },
      {
        id: 2,
        stdin: "6\n-1 0 3 5 9 12\n2",
        expected_output: "-1",
        is_sample: true
      },
      {
        id: 3,
        stdin: "1\n5\n5",
        expected_output: "0",
        is_sample: false
      },
      {
        id: 4,
        stdin: "5\n2 4 6 8 10\n10",
        expected_output: "4",
        is_sample: false
      }
    ]
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    topic: "Stack & Strings",
    companies: ["Amazon", "TCS", "Accenture", "Microsoft", "Goldman Sachs"],
    description: "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.\n\nPrint `true` if valid, or `false` otherwise.",
    examples: [
      {
        input: "()[]{}",
        output: "true",
        explanation: "All bracket pairs are properly matched and closed."
      },
      {
        input: "(]",
        output: "false",
        explanation: "Opening round bracket is closed by square bracket."
      },
      {
        input: "([)]",
        output: "false",
        explanation: "Closing order is invalid."
      }
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(n)",
    interview_tips: [
      "Highlight why the Stack data structure (LIFO) is the ideal choice for nested structures.",
      "Check that stack is non-empty before popping, and check that stack is empty at the end."
    ],
    starter_code: {
      "C++": `#include <iostream>
#include <string>
#include <stack>
using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;

    stack<char> st;
    bool valid = true;

    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') {
            st.push(c);
        } else {
            if (st.empty()) { valid = false; break; }
            char top = st.top();
            st.pop();
            if ((c == ')' && top != '(') ||
                (c == '}' && top != '{') ||
                (c == ']' && top != '[')) {
                valid = false;
                break;
            }
        }
    }

    if (!st.empty()) valid = false;

    cout << (valid ? "true" : "false") << endl;
    return 0;
}
`,
      "Python": `import sys

def valid_parentheses():
    s = sys.stdin.read().strip()
    if not s:
        print("true")
        return
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}

    for char in s:
        if char in mapping.values():
            stack.append(char)
        elif char in mapping:
            if not stack or stack.pop() != mapping[char]:
                print("false")
                return
        else:
            continue

    print("true" if len(stack) == 0 else "false")

if __name__ == "__main__":
    valid_parentheses()
`,
      "Java": `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();

        Deque<Character> stack = new ArrayDeque<>();
        boolean ok = true;
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) { ok = false; break; }
                char top = stack.pop();
                if ((c == ')' && top != '(') ||
                    (c == '}' && top != '{') ||
                    (c == ']' && top != '[')) {
                    ok = false;
                    break;
                }
            }
        }
        if (!stack.isEmpty()) ok = false;
        System.out.println(ok ? "true" : "false");
    }
}
`,
      "C": `#include <stdio.h>
#include <string.h>

int main() {
    char s[10005];
    if (scanf("%s", s) != 1) return 0;
    char stack[10005];
    int top = -1;
    int valid = 1;

    for (int i = 0; s[i] != '\\0'; i++) {
        char c = s[i];
        if (c == '(' || c == '{' || c == '[') {
            stack[++top] = c;
        } else {
            if (top < 0) { valid = 0; break; }
            char prev = stack[top--];
            if ((c == ')' && prev != '(') ||
                (c == '}' && prev != '{') ||
                (c == ']' && prev != '[')) {
                valid = 0;
                break;
            }
        }
    }
    if (top != -1) valid = 0;
    printf("%s\\n", valid ? "true" : "false");
    return 0;
}
`
    },
    test_cases: [
      {
        id: 1,
        stdin: "()[]{}",
        expected_output: "true",
        is_sample: true
      },
      {
        id: 2,
        stdin: "(]",
        expected_output: "false",
        is_sample: true
      },
      {
        id: 3,
        stdin: "([)]",
        expected_output: "false",
        is_sample: false
      },
      {
        id: 4,
        stdin: "{[]}",
        expected_output: "true",
        is_sample: false
      }
    ]
  },
  {
    id: "maximum-subarray",
    title: "Maximum Subarray (Kadane's Algorithm)",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    companies: ["Amazon", "Microsoft", "TCS Digital", "Infosys DSE", "Paytm"],
    description: "Given an integer array `nums`, find the subarray with the largest sum, and print its sum.\n\nA subarray is a contiguous non-empty sequence of elements within an array.",
    examples: [
      {
        input: "9\n-2 1 -3 4 -1 2 1 -5 4",
        output: "6",
        explanation: "The subarray [4, -1, 2, 1] has the largest sum 6."
      },
      {
        input: "1\n1",
        output: "1",
        explanation: "The subarray [1] has the largest sum 1."
      },
      {
        input: "5\n5 4 -1 7 8",
        output: "23",
        explanation: "The subarray [5, 4, -1, 7, 8] has the largest sum 23."
      }
    ],
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(1)",
    interview_tips: [
      "Explain Kadane's Algorithm clearly: decide whether to extend previous subarray or start new subarray.",
      "Discuss handling of all-negative arrays."
    ],
    starter_code: {
      "C++": `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    long long current_sum = nums[0];
    long long max_sum = nums[0];

    for (int i = 1; i < n; i++) {
        current_sum = max((long long)nums[i], current_sum + nums[i]);
        max_sum = max(max_sum, current_sum);
    }

    cout << max_sum << endl;
    return 0;
}
`,
      "Python": `import sys

def max_subarray():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]

    current_sum = nums[0]
    max_sum = nums[0]

    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)

    print(max_sum)

if __name__ == "__main__":
    max_subarray()
`,
      "Java": `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();

        int currentSum = nums[0];
        int maxSum = nums[0];

        for (int i = 1; i < n; i++) {
            currentSum = Math.max(nums[i], currentSum + nums[i]);
            maxSum = Math.max(maxSum, currentSum);
        }

        System.out.println(maxSum);
    }
}
`,
      "C": `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int nums[n];
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);

    int current_sum = nums[0];
    int max_sum = nums[0];

    for (int i = 1; i < n; i++) {
        current_sum = (nums[i] > current_sum + nums[i]) ? nums[i] : (current_sum + nums[i]);
        if (current_sum > max_sum) {
            max_sum = current_sum;
        }
    }

    printf("%d\\n", max_sum);
    return 0;
}
`
    },
    test_cases: [
      {
        id: 1,
        stdin: "9\n-2 1 -3 4 -1 2 1 -5 4",
        expected_output: "6",
        is_sample: true
      },
      {
        id: 2,
        stdin: "1\n1",
        expected_output: "1",
        is_sample: true
      },
      {
        id: 3,
        stdin: "5\n5 4 -1 7 8",
        expected_output: "23",
        is_sample: false
      },
      {
        id: 4,
        stdin: "3\n-5 -2 -8",
        expected_output: "-2",
        is_sample: false
      }
    ]
  }
];

export const getLocalProblemById = (id) => {
  return PROBLEMS_DATA.find((p) => p.id === id) || PROBLEMS_DATA[0];
};

export const getLocalProblemsSummary = () => {
  return PROBLEMS_DATA.map((p) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    topic: p.topic,
    companies: p.companies,
    test_cases_count: p.test_cases?.length || 0,
  }));
};
