import { describe, expect, test } from "vitest";
import { buildShareTargetRoute, canOpenTarget, getShareStatusLabel } from "./shareListLogic";

const ShareListStatus = { Normal: 0, Disabled: 1, Expired: 2, TargetDeleted: 3 } as const;
const ShareTargetType = { Note: 1 } as const;

describe("my share list", () => {
	test("shows the four supported statuses", () => {
		expect(getShareStatusLabel(ShareListStatus.Normal)).toBe("正常");
		expect(getShareStatusLabel(ShareListStatus.Disabled)).toBe("已停用");
		expect(getShareStatusLabel(ShareListStatus.Expired)).toBe("已过期");
		expect(getShareStatusLabel(ShareListStatus.TargetDeleted)).toBe("内容已删除");
	});

	test("does not allow opening a deleted target", () => {
		expect(
			canOpenTarget({
				id: "1",
				targetType: ShareTargetType.Note,
				targetId: "2",
				targetName: "内容已删除",
				shareCode: "code",
				isEnabled: true,
				hasPassword: false,
				status: ShareListStatus.TargetDeleted,
				targetAvailable: false
			})
		).toBe(false);
	});

	test("builds detail routes for file and note targets", () => {
		expect(buildShareTargetRoute({ targetType: 0, targetId: "12" })).toBe("/system/file?openFileId=12");
		expect(buildShareTargetRoute({ targetType: ShareTargetType.Note, targetId: "34" })).toBe("/user/note?openNoteId=34");
	});
});
