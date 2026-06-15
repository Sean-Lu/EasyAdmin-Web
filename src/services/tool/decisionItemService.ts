import request from "@/api/index";

export enum DecisionItemType {
	Food = 1,
	Place = 2
}

export enum CommonState {
	Disable = 0,
	Enable = 1
}

export interface DecisionItem {
	id?: number;
	type: DecisionItemType;
	name: string;
	description?: string;
	state: CommonState;
	sort: number;
}

export class DecisionItemService {
	static async getList(type: DecisionItemType) {
		return request.get<DecisionItem[]>(`/DecisionItem/List?type=${type}`);
	}

	static async add(data: DecisionItem) {
		return request.post<boolean>(`/DecisionItem/Add`, data);
	}

	static async update(data: DecisionItem & { id: number }) {
		return request.post<boolean>(`/DecisionItem/Update`, data);
	}

	static async delete(id: number) {
		return request.post<boolean>(`/DecisionItem/Delete`, { id });
	}

	static async updateState(id: number, state: CommonState) {
		return request.post<boolean>(`/DecisionItem/UpdateState`, { id, state });
	}

	static async draw(type: DecisionItemType, count: number) {
		return request.post<DecisionItem[]>(`/DecisionItem/Draw`, { type, count });
	}
}
