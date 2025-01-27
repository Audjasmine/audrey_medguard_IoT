import mongoose from "mongoose";

const animalDetailsSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    count: {
        type: String,
        required: true
    }
},
{
    timestamps: true
});

const AnimalDetails = mongoose.models.AnimalDetails || mongoose.model('AnimalDetails', animalDetailsSchema);

export default AnimalDetails;