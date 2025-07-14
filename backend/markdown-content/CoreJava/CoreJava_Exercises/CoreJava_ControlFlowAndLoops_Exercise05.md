**5. Control Flow & Loops**

- **Q:** Write a program to simulate a bank ATM where users can check balance, deposit, and withdraw money (using switch-case).
  - *Real-life:* ATM machine interface logic.

  import java.util.Scanner;\
public class BankATM {\
`    `public static void main(String[] args) {\
`        `Scanner sc = new Scanner(System.in);\
`        `int balance = 1000;\
`        `int choice = sc.nextInt();\
`        `if (choice == 1) System.out.println("Balance: " + balance);\
`        `else if (choice == 2) {\
`            `int dep = sc.nextInt();\
`            `balance += dep;\
`            `System.out.println("New Balance: " + balance);\
`        `} else if (choice == 3) {\
`            `int wd = sc.nextInt();\
`            `if (wd <= balance) balance -= wd;\
`            `System.out.println("New Balance: " + balance);\
`        `} else System.out.println("Invalid");\
`    `}\
}

- **Q:** Accept student marks and categorize grades using if-else-if ladder.
  - *Real-life:* Online exam results portal.

  import java.util.Scanner;\
public class GradeCategorizer {\
`    `public static void main(String[] args) {\
`        `Scanner sc = new Scanner(System.in);\
`        `int marks = sc.nextInt();\
`        `if (marks >= 90) System.out.println("Grade A");\
`        `else if (marks >= 75) System.out.println("Grade B");\
`        `else if (marks >= 60) System.out.println("Grade C");\
`        `else System.out.println("Grade D");\
`    `}\
}