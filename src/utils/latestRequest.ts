export type LatestRequestGuard = {
	begin: () => number;
	invalidate: () => void;
	isLatest: (requestId: number) => boolean;
};

export const createLatestRequestGuard = (): LatestRequestGuard => {
	let latestRequestId = 0;
	return {
		begin: () => ++latestRequestId,
		invalidate: () => {
			latestRequestId++;
		},
		isLatest: requestId => requestId === latestRequestId
	};
};
