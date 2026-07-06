import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

let client: DynamoDBDocumentClient | null = null;

function getClient(): DynamoDBDocumentClient {
  if (!client) {
    client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  }
  return client;
}

/**
 * Looks up a participant's most recent final scenario from a previous session.
 * Mirrors identify.py's get_previous_scenario_from_db: scans (not queries, so
 * we stay agnostic of the table's primary key/index structure) and sorts by
 * completion_time to find the latest.
 * Returns null if no table is configured or no previous scenario is found.
 */
export async function getPreviousScenario(
  tableName: string | undefined,
  participantId: string
): Promise<string | null> {
  if (!tableName || !participantId) return null;

  try {
    const result = await getClient().send(
      new ScanCommand({
        TableName: tableName,
        FilterExpression: "participant_id = :pid",
        ExpressionAttributeValues: { ":pid": participantId },
        ProjectionExpression: "participant_id, final_scenario, completion_time",
      })
    );

    const items = result.Items ?? [];
    const sorted = [...items].sort((a, b) =>
      (b.completion_time ?? "").localeCompare(a.completion_time ?? "")
    );
    const withScenario = sorted.find((item) => item.final_scenario);
    return withScenario?.final_scenario ?? null;
  } catch (err) {
    console.error(`Unable to look up previous scenario for ${participantId}:`, err);
    return null;
  }
}

/** Mirrors save.py's save_session_data. */
export async function saveSessionData(
  tableName: string | undefined,
  item: Record<string, unknown>
): Promise<void> {
  if (!tableName) return;
  await getClient().send(new PutCommand({ TableName: tableName, Item: item }));
}
