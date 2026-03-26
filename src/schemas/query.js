const { z } = require('zod');

const matchesQuerySchema = z.object({
  status:  z.enum(['upcoming', 'live', 'finished']).optional(),
  team_id: z.coerce.number().int().positive().optional(),
  season:  z.string().optional(),
  limit:   z.coerce.number().int().min(1).max(100).default(20),
  offset:  z.coerce.number().int().min(0).default(0),
});

module.exports = { matchesQuerySchema };
