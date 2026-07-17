import { eq } from "drizzle-orm";
import { db } from "../index";
import { systemSettings, type SystemSetting } from "../schema";

export async function getSetting(
  key: string,
): Promise<SystemSetting | undefined> {
  const [row] = await db
    .select()
    .from(systemSettings)
    .where(eq(systemSettings.settingKey, key))
    .limit(1);
  return row;
}

export async function getSettingValue(
  key: string,
  fallback: string,
): Promise<string> {
  const row = await getSetting(key);
  return row?.settingValue ?? fallback;
}

/** Settings-authoritative case-number prefix (default CFM). */
export function getCasePrefix(): Promise<string> {
  return getSettingValue("case.number.prefix", "CFM");
}
