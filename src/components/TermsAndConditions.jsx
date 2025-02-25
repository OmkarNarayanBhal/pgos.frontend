import React from 'react';

const TermsAndConditions = ({ onClose }) => {
  return (
    <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">RULES & REGULATIONS</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="text-center mb-4">
              <h4>TARA CO-LIVING PG</h4>
              <p>#8, 2nd Cross, Annaiah Reddy Layout, Bellandur, Bangalore - 560103</p>
              <p>Mobile: 9491512258</p>
            </div>

            <p><strong>Note:</strong> Copy of permanent address/ID proof & guardian's contact details are mandatory at the time of joining.</p>

            <h6 className="mt-4">Dining Rules:</h6>
            <ul>
              <li>It is compulsory to take meals in the dining hall. No meals shall be served in the rooms.</li>
              <li>If you wish to take food to your room, ensure not to waste it.</li>
              <li>Tea, breakfast, and meals will be served in the dining hall during fixed hours only.</li>
            </ul>

            <h6 className="mt-4">General Guidelines:</h6>
            <ul>
              <li>Intimation should be given between the 1st to 5th of the month, and vacating should be done at the end of the month.</li>
              <li>If a resident wants to vacate the PG, they must inform 30 days in advance; otherwise, the deposit will not be refunded.</li>
              <li>Once paid, the token advance and rent cannot be refunded.</li>
              <li>Rent should be paid before the 5th of every month.</li>
              <li>In case of loss of any articles, the management is not responsible.</li>
              <li>Do not waste power and water.</li>
              <li>Guest accommodation with food costs Rs. 500 per day.</li>
              <li>Maintenance charges are Rs. 2000.</li>
              <li>If the owner is not satisfied with a guest's behavior towards the owner or roommates, they must vacate within 2 days.</li>
              <li>Ensure that the door always remains closed. Smoking and drinking are strictly prohibited inside the PG.</li>
              <li>In case of any incidents or suicide occurring due to personal problems, the PG owner or building owner is not responsible.</li>
              <li>Locking period is three months after vacating.</li>
            </ul>

            <h6 className="mt-4">Fines for Lost Items:</h6>
            <ul>
              <li>Room keys: Rs. 500</li>
              <li>Wardrobe keys: Rs. 500</li>
              <li>Chair: Rs. 2000</li>
            </ul>

            <h6 className="mt-4">TIMINGS:</h6>
            <ul>
              <li>BREAKFAST: 8:00 AM to 10:00 AM</li>
              <li>LUNCH: 1:00 PM to 2:00 PM</li>
              <li>DINNER: 8:00 PM to 10:00 PM</li>
            </ul>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions; 
