/**
 * @openapi
 * tags:
 *   name: Rooms
 *   description: Chat rooms
 */

/**
 * @openapi
 * /api/rooms:
 *   get:
 *     summary: List the current user's rooms and recommendations
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: Rooms grouped by relation to the current user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 my:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Room'
 *                 joined:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Room'
 *                 recommended:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Room'
 */

/**
 * @openapi
 * /api/rooms/{id}:
 *   get:
 *     summary: Get a room by id
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The room
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 room:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Room'
 *                     - type: object
 *                       properties:
 *                         role:
 *                           type: string
 *                           nullable: true
 *                           enum: [admin, member]
 *       404:
 *         description: Room not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @openapi
 * /api/rooms:
 *   post:
 *     summary: Create a room (creator becomes admin)
 *     tags: [Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *               theme_id:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Room created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 room:
 *                   $ref: '#/components/schemas/Room'
 */

/**
 * @openapi
 * /api/rooms/{id}/join:
 *   post:
 *     summary: Join a room as a member
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Joined successfully
 *       409:
 *         description: Already a member
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @openapi
 * /api/rooms/{id}/leave:
 *   delete:
 *     summary: Leave a room
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Left successfully
 *       403:
 *         description: Admin cannot leave the room
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Not a member
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
