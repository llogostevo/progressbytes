/*
To use this delete component place the following component code into the row of a mapping that you want
add in the relevant props for the elements being dealt with
check that the recordIdName and recordIdValue is part of the mapping object that is being used
The on delete functino can be altered to use a toast or another component that utilises any error message

NB. this only deletes one record, and corresponding children records assuming cascading deletes are in place
it will not delete records via many to many links or parent records

<DeleteRecord
                  recordIdName='enrollmentid'
                  recordIdValue={enrolled.enrollmentid} 
                  tableName='enrollmenttable'
                  onDelete={(error) => { 
                    if (error) {
                      alert('Deletion failed: ' + error.message);
                    } else {
                      alert('Deletion successful');
                    }
                  }}
                />

*/


import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import React, { FC } from 'react';
import { PostgrestError } from '@supabase/supabase-js';


interface DeleteRecordProps {
    recordIdName: string;
    recordIdValue: number | string;
    tableName: string;
    onDelete: (error?: PostgrestError | Error) => void;
}

const DeleteRecord: FC<DeleteRecordProps> = ({ recordIdName, recordIdValue, tableName, onDelete }) => {
    const supabase = createClientComponentClient();

    const handleDelete = async () => {
        console.log('recordIdName:', recordIdName);
        console.log('recordIdValue:', recordIdValue);
        console.log('tableName:', tableName);
        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq(recordIdName, recordIdValue);

        if (error) {
            console.error(error);
            onDelete(error);
            return;
        }

        onDelete();
    };

    return <button className="m-2 inline-block border border-secondaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-secondaryColor rounded px-4 py-2 transition duration-200" onClick={handleDelete}>Delete</button>;
};

export default DeleteRecord;
