console.log('Training started...');

// TASK ZJ:

// Shunday function yozing, u berilgan array ichidagi
// raqamlarni qiymatini hisoblab qaytarsin.

// MASALAN: reduceNestedArray([1, [1, 2, [4]]]); return 8;

// Yuqoridagi misolda, array nested bo'lgan holdatda ham,
// bizning function ularning yig'indisini hisoblab qaytarmoqda.

function reduceNestedArray(arr: any[]): number {
	let sum = 0;

	for (let item of arr) {
		if (Array.isArray(item)) {
			sum += reduceNestedArray(item); // ichiga kirib hisoblaydi
		} else {
			sum += item; // oddiy number bo‘lsa qo‘shadi
		}
	}

	return sum;
}

// TEST
console.log(reduceNestedArray([1, [1, 2, [4]]]));
