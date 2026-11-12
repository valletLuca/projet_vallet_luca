import { Sequelize, DataTypes, Model, Optional, ModelStatic } from "sequelize";

export const POLLUTION_TYPES = ["plastique", "chimique", "depot-sauvage", "eau", "air", "autre"] as const;

export type PollutionType = (typeof POLLUTION_TYPES)[number];

export const DANGER_LEVEL_MIN = 0;
export const DANGER_LEVEL_MAX = 999;

export interface PollutionAttributes {
  id: number;
  title: string;
  type: PollutionType;
  description: string;
  observedAt: string;
  place: string;
  latitude: number;
  longitude: number;
  dangerLevel: number | null;
  photoUrl: string | null;
  createdAt: Date;
}

export interface PollutionCreationAttributes
  extends Optional<PollutionAttributes, "id" | "dangerLevel" | "photoUrl" | "createdAt"> {}

export interface PollutionInstance
  extends Model<PollutionAttributes, PollutionCreationAttributes>,
    PollutionAttributes {}

export type PollutionModel = ModelStatic<PollutionInstance>;

export default function definePollutions(sequelize: Sequelize, _seq?: typeof Sequelize): PollutionModel {
  const Pollutions = sequelize.define<PollutionInstance>(
    "pollution",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { len: { args: [1, 255], msg: "Le titre ne doit pas dépasser 255 caractères." } }
      },
      type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: { isIn: [POLLUTION_TYPES as unknown as string[]] }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      observedAt: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      place: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { len: { args: [1, 255], msg: "Le lieu ne doit pas dépasser 255 caractères." } }
      },
      latitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: { min: -90, max: 90 }
      },
      longitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: { min: -180, max: 180 }
      },
      dangerLevel: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { isInt: true, min: DANGER_LEVEL_MIN, max: DANGER_LEVEL_MAX }
      },
      photoUrl: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: "pollution",
      freezeTableName: true,
      underscored: true,
      timestamps: false
    }
  );

  return Pollutions;
}
