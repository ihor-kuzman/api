import { Op } from 'sequelize';

export default function isUnique(field) {
    return async function validator(value, b, c) {
        const brand = await this.constructor.findOne({
            where: {
                id: { [Op.ne]: this.id },
                [field]: value,
            },
        });
        if (brand) {
            throw new Error(`${field} already in use`);
        }
    };
}
