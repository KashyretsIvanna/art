-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_ctxProfileId_fkey" FOREIGN KEY ("ctxProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
