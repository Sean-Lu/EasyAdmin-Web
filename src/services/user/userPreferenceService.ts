import request from "@/api/index";
import { BackendId } from "@/api/interface";

export interface ToolboxToolOrderDto {
	toolIds: BackendId[];
}

export class UserPreferenceService {
	static async getToolboxToolOrder() {
		return (await request.get<ToolboxToolOrderDto>("/UserPreference/GetToolboxToolOrder")).data!;
	}

	static async updateToolboxToolOrder(toolIds: BackendId[]) {
		return (await request.post<ToolboxToolOrderDto>("/UserPreference/UpdateToolboxToolOrder", { toolIds })).data!;
	}
}
