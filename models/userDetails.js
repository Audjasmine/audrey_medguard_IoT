import mongoose from "mongoose";
import AnimalDetails from "./animalDetails";
import CropDetails from "./cropDetails";
import { refreshModel } from "@/utils/modelUtils";

const userDetailsSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    farm_name: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    province: {
        type: String,
        required: true
    },
    farm_size: {
        type: String,
        required: true
    },
    farm_type: {
        type: String,
        required: true
    },
    employess_number: {
        type: String,
        required: true
    },
    crops: [CropDetails.schema],
    animals: [AnimalDetails.schema]
},
{
    timestamps: true
});

const UserDetails = refreshModel('UserDetails', userDetailsSchema);

export default UserDetails;



