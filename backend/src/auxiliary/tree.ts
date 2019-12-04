const getChildren = <T extends { id: any; }>
(all: T[], cur: T | undefined, prop: string): T[] => {
	let res: T[] = [];
	if (cur && (cur as any)[prop]) {
		for (const currentChild of (cur as any)[prop]) {
			const child = all.find(entity => entity.id == currentChild.id);
			if (child != undefined) {
				res = [...res, child, ...getChildren(all, child, prop)]
			}
		}
	}
	return res;
}

const getParents = <T extends { id: any; }>
	(all: T[], cur: T | undefined, prop: string): T[] => {
	let res: T[] = [];
	if (cur && (cur as any)[prop]) {
		const parent = all.find(entity => entity.id == (cur as any)[prop].id);
		if (parent != undefined) {
			res = [...res, parent, ...getParents(all, parent, prop)]
		}
	}
	return res;
}

export { getChildren, getParents };