export const buildKeyTree = records => {
	const root = [];
	const nodeMap = new Map();

	records.forEach(record => {
		const parts = record.key.split(":");
		let path = "";
		let level = root;

		parts.forEach((part, index) => {
			path = path ? `${path}:${part}` : part;
			let node = nodeMap.get(path);
			const isLeaf = index === parts.length - 1;

			if (!node) {
				node = { key: path, title: part, isLeaf };
				if (!isLeaf) node.children = [];
				nodeMap.set(path, node);
				level.push(node);
			} else if (!isLeaf && !node.children) {
				node.isLeaf = false;
				node.children = [];
			}

			if (isLeaf) node.record = record;
			level = node.children || [];
		});
	});

	return root;
};

export const getAllExpandableKeys = nodes =>
	nodes.reduce((keys, node) => {
		if (node.children?.length) {
			keys.push(node.key, ...getAllExpandableKeys(node.children));
		}
		return keys;
	}, []);

export const resolveRefreshPage = page => (typeof page === "number" && Number.isInteger(page) && page > 0 ? page : 1);
