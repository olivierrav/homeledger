// FILENAME: src/services/UserService.ts
import { User } from "@db";
import { RequestContext } from "@middlewares/userContext";

export class UserService {
    private context: RequestContext;

    constructor(context: RequestContext) {
        this.context = context;
    }

    async ensureUser(): Promise<User> {
        const ctxUser = this.context.user;

        if (!ctxUser) {
            throw new Error("Missing Keycloak user in context");
        }

        const keycloakSub = ctxUser.id;
        const email = ctxUser.email || "";
        const firstName = ctxUser.firstName || null;
        const lastName = ctxUser.lastName || null;

        if (!keycloakSub || !email) {
            throw new Error("Missing keycloak sub or email in context user");
        }

        const existing = await User.findOne({
            where: { keycloakSub }
        });

        if (!existing) {
            const created = await User.create({
                keycloakSub,
                email,
                firstName,
                lastName
            });
            return created;
        }

        let hasChanges = false;

        if (existing.email !== email) {
            existing.email = email;
            hasChanges = true;
        }
        if (existing.firstName !== firstName) {
            existing.firstName = firstName;
            hasChanges = true;
        }
        if (existing.lastName !== lastName) {
            existing.lastName = lastName;
            hasChanges = true;
        }

        if (hasChanges) {
            await existing.save();
        }

        return existing;
    }
}