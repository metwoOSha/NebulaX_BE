/**
 * @openapi
 * tags:
 *   name: Tags
 *   description: Interest tags
 */

/**
 * @openapi
 * /api/tags:
 *   get:
 *     summary: List all tags
 *     tags: [Tags]
 *     security: []
 *     responses:
 *       200:
 *         description: List of tags
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tags:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tag'
 */
