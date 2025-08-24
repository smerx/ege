// Test file to verify code cleaning functions
import { cleanCodeForAI, cleanStudentCode, extractCodeFromSubmission } from './codeUtils';

// Test cases
const testCode1 = `$(
    platform info
    python version 3.9
    
    num1 = int(input("Enter a number: "))
    num2 = int(input("Enter another number: "))
    print((num1, num2)[num1 > num2])
    print((num1, num1 * -1)[num1 < 0])
    print(("Не делится на 3", "Делится на 3")[num1 % 3 == 0])
    age = int(input("Enter your age: "))
    print(("Совершеннолетний", "Несовершеннолетний")[age < 18])
)`;

const testCode2 = `
        num1 = int(input("Enter a number: "))
        num2 = int(input("Enter another number: "))
        print((num1, num2)[num1 > num2])
        age = int(input("Enter your age: "))
        print(("Совершеннолетний", "Несовершеннолетний")[age < 18])
`;

console.log("Original code 1:");
console.log(testCode1);
console.log("\nCleaned for AI:");
console.log(cleanCodeForAI(testCode1));

console.log("\n" + "=".repeat(50));

console.log("Original code 2:");
console.log(testCode2);
console.log("\nCleaned for AI:");
console.log(cleanCodeForAI(testCode2));

export {};
