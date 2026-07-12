import { describe, expect, it, vi } from "vitest";
vi.mock("@/api", () => ({ default: { get: vi.fn() } }));

import http from "@/api";
import { getServerMonitorOverview } from "./serverMonitorService";

describe("serverMonitorService", () => {
	it("loads the server monitor overview without the global loading mask", async () => {
		const get = vi.spyOn(http, "get").mockResolvedValue({ data: { hostName: "test" } } as never);

		await expect(getServerMonitorOverview()).resolves.toEqual({ hostName: "test" });
		expect(get).toHaveBeenCalledWith("/serverMonitor/overview", undefined, { headers: { noLoading: true } });
		get.mockRestore();
	});
});
