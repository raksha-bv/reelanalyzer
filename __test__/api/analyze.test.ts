// __tests__/api/analyze.test.ts
/**
 * @jest-environment node
 */
import { testApiHandler } from "next-test-api-route-handler";
import * as appHandler from "@/app/api/analyze/route";

describe("/api/analyze", () => {
  it("should analyze Instagram reel with live URL", async () => {
    await testApiHandler({
      appHandler,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Use a direct reel URL instead of profile
            url: "https://www.instagram.com/reel/DFMgjRsS_Xw/",
            forceRefresh: true,
          }),
        });

        const data = await response.json();
        console.log("API Response:", data); // Debug output

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toHaveProperty("reelId");
        expect(data.data).toHaveProperty("username");
      },
    });
  }, 60000); // Increase timeout to 60 seconds
});
