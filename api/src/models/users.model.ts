import { Sequelize, DataTypes, Model, Optional, ModelStatic } from "sequelize";

export interface UserAttributes {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, "id" | "createdAt"> {}

export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {}

export type UserModel = ModelStatic<UserInstance>;

export default function defineUsers(sequelize: Sequelize, _seq?: typeof Sequelize): UserModel {
  const Users = sequelize.define<UserInstance>(
    "user",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { len: { args: [1, 255], msg: "Le prénom doit contenir entre 1 et 255 caractères." } }
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { len: { args: [1, 255], msg: "Le nom doit contenir entre 1 et 255 caractères." } }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: { msg: "L'adresse e-mail n'est pas valide." },
          len: { args: [1, 255], msg: "L'adresse e-mail ne doit pas dépasser 255 caractères." }
        }
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: "users",
      freezeTableName: true,
      underscored: true,
      timestamps: false
    }
  );

  return Users;
}
