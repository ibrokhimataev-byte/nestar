console.log('Training started...');

// TASK-ZK:

// Shunday function yozing, u har soniyada bir marta consolega 1 dan 5 gacha bolgan raqamlarni chop etsin va 5 soniyadan keyin ishini toxtatsin.
// MASALAN: printNumbers()

function printNumbers(): void {
  let count = 1;

  const interval = setInterval(() => {
    console.log(count);
    count++;

    if (count > 5) {
      clearInterval(interval); // to‘xtatadi
    }
  }, 1000);
}


// TEST
printNumbers();



// TASK ZJ:

// Shunday function yozing, u berilgan array ichidagi
// raqamlarni qiymatini hisoblab qaytarsin.

// MASALAN: reduceNestedArray([1, [1, 2, [4]]]); return 8;

// Yuqoridagi misolda, array nested bo'lgan holdatda ham,
// bizning function ularning yig'indisini hisoblab qaytarmoqda.

// function reduceNestedArray(arr: any[]): number {
// 	let sum = 0;

// 	for (let item of arr) {
// 		if (Array.isArray(item)) {
// 			sum += reduceNestedArray(item); // ichiga kirib hisoblaydi
// 		} else {
// 			sum += item; // oddiy number bo‘lsa qo‘shadi
// 		}
// 	}

// 	return sum;
// }

// // TEST
// console.log(reduceNestedArray([1, [1, 2, [4]]]));
