import mongoose from "mongoose";

const cropDetailsSchema = new mongoose.Schema({
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

const CropDetails = mongoose.models.CropDetails || mongoose.model('CropDetails', cropDetailsSchema);

export default CropDetails;